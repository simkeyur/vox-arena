import asyncio
import glob
import importlib.resources
import os
import shutil
import time
import uuid
from contextlib import asynccontextmanager
from typing import Dict, Any, List, Optional

import yaml
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from loguru import logger
from pydantic import BaseModel

from voxarena import runner
from voxarena.config import get_setting, is_dev_mode, set_setting, settings
from voxarena.database import (
    bootstrap_utterances_if_empty,
    delete_run_from_db,
    init_db,
    list_run_ids,
    list_run_summaries,
    load_run_manifest,
    load_utterances_from_db,
    reset_db,
    save_run_manifest,
    save_utterances_to_db,
)
from voxarena.manifest import RunManifest
from voxarena.providers import api_key_env, provider_names
from voxarena.report_generator import generate_report
from voxarena.runner import ACTIVE_HARNESSES, create_pending_manifest


def _backfill_manifests() -> None:
    """Walk results/ for manifest.json files and upsert any missing in SQLite.

    Skips after first successful pass unless a manifest.json on disk is newer
    than the last-backfill timestamp — avoids paying disk-walk cost on every
    boot once the install has accumulated a lot of runs.
    """
    last_backfill = get_setting("LAST_BACKFILL_TS")
    last_backfill_ts = float(last_backfill) if last_backfill else 0.0

    # Cheap mtime probe: if no manifest is newer than our last pass, skip.
    results_dir = settings.RESULTS_DIR
    if last_backfill_ts > 0 and os.path.isdir(results_dir):
        newest = 0.0
        for root, _, files in os.walk(results_dir):
            for f in files:
                if f == "manifest.json":
                    try:
                        newest = max(newest, os.path.getmtime(os.path.join(root, f)))
                    except OSError:
                        pass
                    if newest > last_backfill_ts:
                        break
            if newest > last_backfill_ts:
                break
        if newest <= last_backfill_ts:
            logger.debug("Backfill skipped (no manifest.json newer than last pass).")
            return

    known_ids = set(list_run_ids())
    manifest_files = glob.glob(os.path.join(results_dir, "**", "manifest.json"), recursive=True)
    for file_path in manifest_files:
        try:
            manifest = RunManifest.load(file_path)
            if manifest.run_id not in known_ids:
                save_run_manifest(manifest)
        except Exception as e:
            logger.error(f"Failed to backfill manifest at {file_path}: {e}")

    set_setting("LAST_BACKFILL_TS", str(time.time()))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # Disk walks + YAML/JSON parses shouldn't block the event loop on startup.
    await asyncio.to_thread(_backfill_manifests)
    await asyncio.to_thread(bootstrap_utterances_if_empty)
    await asyncio.to_thread(_prune_synth_cache)
    yield


def _prune_synth_cache() -> None:
    """Drop synthesized WAVs whose hash doesn't match any current utterance text."""
    try:
        from voxarena.audio_cache import prune_orphan_synth_files
        utts = load_utterances_from_db()
        prune_orphan_synth_files([u.get("text", "") for u in utts])
    except Exception as e:
        logger.warning(f"Synth-cache prune failed: {e}")


app = FastAPI(
    title="VoxArena API",
    description="Backend service for controlling runs and evaluating realtime voice agents",
    version="1.0",
    lifespan=lifespan,
)

# CORS: when allow_credentials is True, the wildcard origin is invalid per the
# CORS spec and browsers reject it. The control panel is co-served from this
# same FastAPI app, so we only need to allow the Vite dev server origins here.
_dev_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_dev_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _api_key_for(provider: str) -> Optional[str]:
    return get_setting(api_key_env(provider))


def _require_api_key(provider: str) -> None:
    if not _api_key_for(provider):
        raise HTTPException(
            status_code=400,
            detail=f"No API key configured for '{provider}'. Set {api_key_env(provider)} in .env.",
        )


def _new_run_id(suffix: str = "") -> str:
    """Collision-resistant run id even when two requests arrive in the same second."""
    return f"run_{int(time.time())}_{uuid.uuid4().hex[:8]}{suffix}"


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "voxarena"}


@app.get("/api/status")
@app.get("/api/config")
async def get_status():
    """Check connectivity and loaded configuration."""
    providers = ["gemini", "openai"]
    google_key = get_setting("GOOGLE_API_KEY")
    openai_key = get_setting("OPENAI_API_KEY")
    return {
        "status": "ready",
        "base_dir": settings.BASE_DIR,
        "results_dir": settings.RESULTS_DIR,
        "script_dir": settings.SCRIPT_DIR,
        "audio_dir": settings.AUDIO_DIR,
        "review_dir": settings.REVIEW_DIR,
        "has_google_key": bool(google_key),
        "has_openai_key": bool(openai_key),
        "providers": providers,
        "has_api_key": {p: bool(_api_key_for(p)) for p in providers},
        "transports": ["direct-injection", "webrtc-local"],
        "gemini_model": get_setting("GEMINI_MODEL") or settings.GEMINI_MODEL,
        "openai_model": get_setting("OPENAI_MODEL") or settings.OPENAI_MODEL,
        "active_template": get_setting("ACTIVE_TEMPLATE") or "restaurant",
    }


class SettingsUpdateRequest(BaseModel):
    gemini_model: str
    openai_model: str
    google_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    # Evaluation model (optional — keep existing values if omitted)
    evaluation_model: Optional[str] = None
    evaluation_provider: Optional[str] = None
    # TTS configuration (optional)
    tts_engine: Optional[str] = None
    openai_tts_model: Optional[str] = None
    openai_tts_voice: Optional[str] = None
    google_tts_voice: Optional[str] = None


def _current_tts_capabilities() -> dict:
    """Which TTS engines this host can actually use right now."""
    from voxarena.audio_cache import _engine_available
    return {
        "openai": _engine_available("openai"),
        "google": _engine_available("google"),
        "local": _engine_available("local"),
    }


@app.get("/api/settings")
async def get_settings():
    google_key = get_setting("GOOGLE_API_KEY")
    openai_key = get_setting("OPENAI_API_KEY")
    return {
        "gemini_model": get_setting("GEMINI_MODEL") or settings.GEMINI_MODEL,
        "openai_model": get_setting("OPENAI_MODEL") or settings.OPENAI_MODEL,
        "google_api_key": "••••••••" if google_key else "",
        "openai_api_key": "••••••••" if openai_key else "",
        "evaluation_model": get_setting("EVALUATION_MODEL") or settings.EVALUATION_MODEL,
        "evaluation_provider": get_setting("EVALUATION_PROVIDER") or settings.EVALUATION_PROVIDER,
        "tts_engine": get_setting("TTS_ENGINE") or settings.TTS_ENGINE,
        "openai_tts_model": get_setting("OPENAI_TTS_MODEL") or settings.OPENAI_TTS_MODEL,
        "openai_tts_voice": get_setting("OPENAI_TTS_VOICE") or settings.OPENAI_TTS_VOICE,
        "google_tts_voice": get_setting("GOOGLE_TTS_VOICE") or settings.GOOGLE_TTS_VOICE,
        "tts_engine_available": _current_tts_capabilities(),
    }


@app.post("/api/settings")
async def update_settings(req: SettingsUpdateRequest):
    set_setting("GEMINI_MODEL", req.gemini_model)
    set_setting("OPENAI_MODEL", req.openai_model)

    if req.google_api_key is not None and req.google_api_key != "••••••••":
        set_setting("GOOGLE_API_KEY", req.google_api_key)
    if req.openai_api_key is not None and req.openai_api_key != "••••••••":
        set_setting("OPENAI_API_KEY", req.openai_api_key)

    if req.evaluation_model:
        set_setting("EVALUATION_MODEL", req.evaluation_model)
    if req.evaluation_provider:
        set_setting("EVALUATION_PROVIDER", req.evaluation_provider)

    if req.tts_engine:
        if req.tts_engine not in ("auto", "openai", "google", "local"):
            raise HTTPException(status_code=400, detail=f"Invalid tts_engine: {req.tts_engine}")
        set_setting("TTS_ENGINE", req.tts_engine)
    if req.openai_tts_model:
        set_setting("OPENAI_TTS_MODEL", req.openai_tts_model)
    if req.openai_tts_voice:
        set_setting("OPENAI_TTS_VOICE", req.openai_tts_voice)
    if req.google_tts_voice:
        set_setting("GOOGLE_TTS_VOICE", req.google_tts_voice)

    return {"status": "saved"}


class VerifyKeyRequest(BaseModel):
    provider: str
    api_key: str


@app.post("/api/settings/verify")
async def verify_api_key(req: VerifyKeyRequest):
    """Statelessly check if the provided (or stored) API key connects successfully."""
    provider = req.provider.lower()
    if provider not in ["gemini", "openai"]:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    api_key = req.api_key
    if api_key == "••••••••" or not api_key:
        env_var = "GOOGLE_API_KEY" if provider == "gemini" else "OPENAI_API_KEY"
        api_key = get_setting(env_var)
        if not api_key:
            raise HTTPException(status_code=400, detail=f"No key saved for '{provider}' to verify.")

    import httpx
    try:
        if provider == "gemini":
            # Call models list API on Gemini (returns 200 on valid key, 400/403 on invalid)
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
            async with httpx.AsyncClient() as client:
                res = await client.get(url, timeout=5.0)
            if res.status_code == 200:
                return {"status": "success", "message": "Gemini API key verified successfully."}
            else:
                detail = "Invalid Gemini API Key."
                try:
                    err_msg = res.json().get("error", {}).get("message", "Invalid API Key")
                    detail = f"Gemini API error: {err_msg}"
                except Exception:
                    pass
                raise HTTPException(status_code=400, detail=detail)
        else:
            # Call models API on OpenAI (returns 200 on valid key, 401 on invalid)
            url = "https://api.openai.com/v1/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            async with httpx.AsyncClient() as client:
                res = await client.get(url, headers=headers, timeout=5.0)
            if res.status_code == 200:
                return {"status": "success", "message": "OpenAI API key verified successfully."}
            else:
                detail = "Invalid OpenAI API Key."
                try:
                    err_msg = res.json().get("error", {}).get("message", "Invalid API Key")
                    detail = f"OpenAI API error: {err_msg}"
                except Exception:
                    pass
                raise HTTPException(status_code=400, detail=detail)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Network connection failure: {e}")


@app.get("/api/utterances/json")
async def get_utterances_json():
    """Retrieve scripted conversation utterances as a parsed JSON array from SQLite."""
    try:
        return load_utterances_from_db()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load utterances: {e}")


class UtterancesJsonUpdateRequest(BaseModel):
    utterances: List[Dict[str, Any]]


@app.post("/api/utterances/json")
async def update_utterances_json(req: UtterancesJsonUpdateRequest):
    """Overwrite SQLite utterances and persist them on the currently-active template."""
    try:
        from voxarena.database import update_template_utterances_db
        save_utterances_to_db(req.utterances)

        active_template = get_setting("ACTIVE_TEMPLATE")
        if active_template:
            update_template_utterances_db(active_template, req.utterances)

        return {"status": "saved", "count": len(req.utterances)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save utterances: {e}")


@app.get("/api/templates")
async def get_templates():
    """Retrieve all templates (built-in + custom) from SQLite."""
    try:
        from voxarena.database import list_templates_db
        return [
            {
                "id": t["id"],
                "name": t["name"],
                "description": t["description"],
                "turns_count": len(t.get("utterances", [])),
                "is_builtin": t.get("is_builtin", False),
                # Kept for UI back-compat; "custom" == NOT built-in.
                "is_custom": not t.get("is_builtin", False),
                "system_prompt": t.get("system_prompt", ""),
                "tools": t.get("tools", []),
            }
            for t in list_templates_db()
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {e}")


class CreateTemplateRequest(BaseModel):
    name: str
    description: str
    first_message: Optional[str] = None
    copy_from_template_id: Optional[str] = None
    utterances: Optional[List[Dict[str, Any]]] = None
    system_prompt: Optional[str] = None
    tools: Optional[List[Dict[str, Any]]] = None


@app.post("/api/templates")
async def create_template(req: CreateTemplateRequest):
    """Create a new (non-builtin) template in the DB."""
    try:
        import re
        from voxarena.database import get_template_db, upsert_template_db

        base_id = re.sub(r"[^a-z0-9]+", "_", req.name.lower()).strip("_") or "template"
        template_id = f"custom_{base_id}"
        suffix = 1
        while get_template_db(template_id) is not None:
            template_id = f"custom_{base_id}_{suffix}"
            suffix += 1

        # Prefer explicit system_prompt/tools from the request. Otherwise clone
        # from the requested parent template (and only then fall back to the
        # first available template — the bug we fixed earlier where every new
        # template silently inherited Saffron Leaf lives in the inverse path).
        if req.system_prompt is not None or req.tools is not None:
            system_prompt = (req.system_prompt or "").strip() or "You are a helpful assistant."
            tools = req.tools if req.tools is not None else []
        else:
            copy_id = req.copy_from_template_id
            if not copy_id or copy_id == "custom":
                copy_id = get_setting("LAST_LOADED_TEMPLATE") or "restaurant"
            parent_tpl = get_template_db(copy_id) or get_template_db("restaurant")
            if not parent_tpl:
                system_prompt = "You are a helpful assistant."
                tools = []
            else:
                system_prompt = parent_tpl["system_prompt"]
                tools = parent_tpl["tools"]

        if req.utterances is not None:
            utterances = req.utterances
        else:
            utterances = [{
                "id": "u01",
                "text": (req.first_message or "").strip(),
                "expect": {"response_contains": []},
            }]

        upsert_template_db({
            "id": template_id,
            "name": req.name.strip(),
            "description": req.description.strip(),
            "system_prompt": system_prompt,
            "tools": tools,
            "utterances": utterances,
            "is_builtin": False,
        })
        logger.info(f"Created new template: {template_id} ({req.name})")
        return {"status": "created", "template_id": template_id, "name": req.name}
    except Exception as e:
        logger.error(f"Failed to create template: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create template: {e}")


class UpdateTemplateMetadataRequest(BaseModel):
    name: str
    description: str


@app.post("/api/templates/{template_id}/metadata")
async def update_template_metadata(template_id: str, req: UpdateTemplateMetadataRequest):
    """Update a template's name and description. Works for built-in templates too —
    edits persist until the user resets the DB from the Danger Zone."""
    try:
        from voxarena.database import update_template_metadata_db
        ok = update_template_metadata_db(template_id, req.name.strip(), req.description.strip())
        if not ok:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found.")
        logger.info(f"Updated metadata for template: {template_id}")
        return {"status": "updated", "template_id": template_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update template metadata: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update template: {e}")


class UpdateTemplateAgentRequest(BaseModel):
    system_prompt: str
    tools: List[Dict[str, Any]]


@app.post("/api/templates/{template_id}/agent")
async def update_template_agent(template_id: str, req: UpdateTemplateAgentRequest):
    """Update a template's system_prompt and tools. Built-ins are editable too."""
    try:
        from voxarena.database import update_template_agent_db
        ok = update_template_agent_db(template_id, req.system_prompt.strip(), req.tools)
        if not ok:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found.")
        logger.info(f"Updated agent definition for template: {template_id}")
        return {"status": "updated", "template_id": template_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update template agent: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update template agent: {e}")


@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str):
    """Delete ANY template (built-in or custom). Built-ins are restored when the
    user clicks Reset All Data in the Danger Zone."""
    try:
        from voxarena.database import delete_template_db, first_available_template_id
        ok = delete_template_db(template_id)
        if not ok:
            raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found.")

        # If the deleted template was active, fall back to whatever's left.
        if (get_setting("ACTIVE_TEMPLATE") or "") == template_id:
            fallback = first_available_template_id()
            if fallback:
                set_setting("ACTIVE_TEMPLATE", fallback)
            else:
                set_setting("ACTIVE_TEMPLATE", "")
        logger.info(f"Deleted template: {template_id}")
        return {"status": "deleted", "template_id": template_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete template: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete template: {e}")


@app.post("/api/templates/{template_id}/load")
async def load_template(template_id: str):
    """Overwrite SQLite utterances with turns from the specified template."""
    try:
        from voxarena.database import get_template_db, list_templates_db
        tpl = get_template_db(template_id)
        if tpl is None:
            ids = [t["id"] for t in list_templates_db()]
            raise HTTPException(
                status_code=404,
                detail=f"Template '{template_id}' not found. Available: {ids}",
            )
        save_utterances_to_db(tpl["utterances"])
        set_setting("ACTIVE_TEMPLATE", template_id)
        set_setting("LAST_LOADED_TEMPLATE", template_id)
        return {
            "status": "loaded",
            "template_id": template_id,
            "count": len(tpl["utterances"]),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load template: {e}")


@app.get("/api/runs", response_model=List[Dict[str, Any]])
async def list_runs():
    try:
        return list_run_summaries()
    except Exception as e:
        logger.error(f"Failed to list runs from SQLite: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")


@app.get("/api/runs/{run_id}", response_model=RunManifest)
async def get_run(run_id: str):
    try:
        manifest = load_run_manifest(run_id)
        if manifest:
            return manifest
    except Exception as e:
        logger.error(f"Failed to load run {run_id} from SQLite: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {e}")

    raise HTTPException(status_code=404, detail=f"Run manifest with ID {run_id} not found.")


class RunRequest(BaseModel):
    provider: str
    model: str
    transport: str
    num_turns: Optional[int] = None


class CompareRunRequest(BaseModel):
    transport: str
    num_turns: Optional[int] = None
    # provider -> model id (None means use that provider's default)
    models: Dict[str, Optional[str]]


async def run_bakeoff_in_background(provider: str, model: str, transport: str, run_id: str, num_turns: Optional[int] = None):
    """Thin wrapper that swallows runner.run_evaluation's exception so the
    BackgroundTask coroutine doesn't bubble an unhandled error."""
    try:
        await runner.run_evaluation(provider, model, transport, run_id, num_turns)
    except Exception:
        # runner already logged and marked the manifest as failed
        pass


@app.post("/api/run")
async def start_run(req: RunRequest, background_tasks: BackgroundTasks):
    _require_api_key(req.provider)
    run_id = _new_run_id()
    create_pending_manifest(req.provider, req.model, req.transport, run_id)
    background_tasks.add_task(
        run_bakeoff_in_background,
        req.provider,
        req.model,
        req.transport,
        run_id,
        req.num_turns,
    )
    return {"status": "started", "run_id": run_id}


@app.post("/api/run/compare")
async def start_compare_run(req: CompareRunRequest, background_tasks: BackgroundTasks):
    """Kick off N provider runs in parallel for side-by-side comparison."""
    if not req.models or len(req.models) < 2:
        raise HTTPException(status_code=400, detail="compare needs at least two providers in 'models'.")

    registered = set(provider_names())
    unknown = [p for p in req.models if p not in registered]
    if unknown:
        raise HTTPException(status_code=400, detail=f"Unknown provider(s) {unknown}. Registered: {sorted(registered)}")

    for p in req.models:
        _require_api_key(p)

    run_ids: Dict[str, str] = {}
    for provider, model in req.models.items():
        resolved_model = model or getattr(settings, f"{provider.upper()}_MODEL", "")
        run_id = _new_run_id(suffix=f"_{provider}")
        run_ids[provider] = run_id
        create_pending_manifest(provider, resolved_model, req.transport, run_id)
        background_tasks.add_task(
            run_bakeoff_in_background, provider, resolved_model, req.transport, run_id, req.num_turns
        )

    return {"status": "started", "run_ids": run_ids}


@app.post("/api/run/{run_id}/stop")
async def stop_run(run_id: str):
    if not runner.stop_run(run_id):
        raise HTTPException(status_code=404, detail=f"Active run {run_id} not found or already completed.")
    return {"status": "stop_requested", "run_id": run_id}


@app.delete("/api/runs/{run_id}")
async def delete_run(run_id: str):
    try:
        manifest = load_run_manifest(run_id)
    except Exception as e:
        logger.error(f"Failed to load run {run_id} from SQLite: {e}")
        raise HTTPException(status_code=500, detail=f"Database error loading run: {e}")
    if not manifest:
        raise HTTPException(status_code=404, detail=f"Run manifest with ID {run_id} not found.")
    if run_id in ACTIVE_HARNESSES:
        runner.stop_run(run_id)
    run_dir = os.path.join(settings.RESULTS_DIR, manifest.provider, run_id)
    if os.path.exists(run_dir):
        try:
            shutil.rmtree(run_dir)
            logger.info(f"Deleted run folder on disk: {run_dir}")
        except Exception as e:
            logger.error(f"Failed to delete run folder {run_dir}: {e}")
    try:
        delete_run_from_db(run_id)
    except Exception as e:
        logger.error(f"Failed to delete run {run_id} from SQLite DB: {e}")
        raise HTTPException(status_code=500, detail=f"Database error deleting run: {e}")
    return {"status": "deleted", "run_id": run_id}


@app.post("/api/database/reset")
async def reset_database():
    """Factory-reset: wipe runs, audio, custom templates, and restore built-in
    templates from BUILTIN_TEMPLATES in voxarena/templates.py."""
    for run_id in list(ACTIVE_HARNESSES.keys()):
        runner.stop_run(run_id)

    try:
        from voxarena.templates import BUILTIN_TEMPLATES
        reset_db(restore_builtin_templates=BUILTIN_TEMPLATES)
        # After reseed, point ACTIVE_TEMPLATE at restaurant (if it exists post-reset).
        set_setting("ACTIVE_TEMPLATE", "restaurant" if "restaurant" in BUILTIN_TEMPLATES else "")
        set_setting("LAST_LOADED_TEMPLATE", "restaurant" if "restaurant" in BUILTIN_TEMPLATES else "")
    except Exception as e:
        logger.error(f"Failed to reset SQLite database: {e}")
        raise HTTPException(status_code=500, detail=f"Database error during reset: {e}")

    for provider in provider_names():
        provider_dir = os.path.join(settings.RESULTS_DIR, provider)
        if os.path.exists(provider_dir):
            try:
                shutil.rmtree(provider_dir)
                logger.info(f"Deleted results folder on disk: {provider_dir}")
            except Exception as e:
                logger.error(f"Failed to delete results folder {provider_dir}: {e}")

    return {"status": "reset"}


@app.post("/api/report")
async def compile_report():
    try:
        generate_report()
        return {"status": "compiled", "report_path": os.path.join(settings.BASE_DIR, "analysis", "report.md")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


app.mount("/api/results", StaticFiles(directory=settings.RESULTS_DIR), name="results")

# Serve compiled frontend static files
ui_dist_path = None

if not is_dev_mode:
    try:
        pkg_ui_dist = importlib.resources.files("voxarena").joinpath("ui_dist")
        if pkg_ui_dist.exists():
            ui_dist_path = str(pkg_ui_dist)
    except Exception:
        pass

if not ui_dist_path:
    ui_dist_path = os.path.join(settings.BASE_DIR, "ui", "dist")

if os.path.exists(ui_dist_path):
    logger.info(f"Serving static files from {ui_dist_path}")
    app.mount("/", StaticFiles(directory=ui_dist_path, html=True), name="ui")
else:
    logger.warning(f"UI build directory not found at {ui_dist_path}. Run frontend dev server separately or build the UI.")

    @app.get("/")
    async def index_fallback():
        return {"message": "FastAPI is running. UI dist directory not found. Please build the UI."}
