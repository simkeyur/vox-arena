import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sun, Moon, Play, Pause, BarChart3, History, Settings,
  ArrowRightLeft,
  Trash2, CheckCircle2, XCircle, AlertCircle, ArrowLeft,
  ChevronLeft, ChevronRight, LayoutDashboard, Plus, Cpu, MessageSquare, ShieldAlert, ShieldCheck, GitCompare,
  DollarSign, Key, Volume2, Target, Zap, Edit2
} from 'lucide-react';
import logoUrl from './assets/logo.png';
import './App.css';
import AudioWaveformVisualizer from './components/AudioWaveformVisualizer';
import AudioPlayer from './components/AudioPlayer';
import LivePipelineVisualizer from './components/LivePipelineVisualizer';
import MetricComparison from './components/MetricComparison';
import SummaryStat from './components/SummaryStat';
import ConfirmModal from './components/modals/ConfirmModal';
import CreateTemplateModal from './components/modals/CreateTemplateModal';
import EditTemplateModal from './components/modals/EditTemplateModal';
import AddUtteranceModal from './components/modals/AddUtteranceModal';
import NewRunModal from './components/modals/NewRunModal';
import DashboardTab from './components/tabs/DashboardTab';
import RunsTab from './components/tabs/RunsTab';
import SettingsTab from './components/tabs/SettingsTab';
import useTemplates from './hooks/useTemplates';
import useRuns from './hooks/useRuns';
import useBackendConfig from './hooks/useBackendConfig';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);
  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateFirstMessage, setNewTemplateFirstMessage] = useState('');
  const [newTemplateMode, setNewTemplateMode] = useState('scratch'); // 'scratch' | 'clone'
  const [newTemplateSystemPrompt, setNewTemplateSystemPrompt] = useState('');
  const [newTemplateToolsJson, setNewTemplateToolsJson] = useState('[]');
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateDesc, setEditTemplateDesc] = useState('');
  const [editTemplateSystemPrompt, setEditTemplateSystemPrompt] = useState('');
  const [editTemplateToolsJson, setEditTemplateToolsJson] = useState('[]');
  const [editTemplateIsBuiltin, setEditTemplateIsBuiltin] = useState(false);
  const [editTemplateOriginalId, setEditTemplateOriginalId] = useState(null);
  // Backend config, runs, templates moved to hooks (see calls below). Kept as
  // destructured names so the rest of App.jsx is unchanged.
  
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  // Dev state for triggering new runs
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [selectedModel, setSelectedModel] = useState('gemini-3.1-flash-live-preview');
  const [selectedTransport, setSelectedTransport] = useState('direct-injection');
  const [numTurns, setNumTurns] = useState(10);
  const [runBothInParallel, setRunBothInParallel] = useState(false);

  // Parallel comparison run tracking
  const [compareRunIds, setCompareRunIds] = useState(null); // { gemini, openai }
  const [compareData, setCompareData] = useState(null); // { gemini, openai }

  // Settings screen state
  const [settingsGeminiModel, setSettingsGeminiModel] = useState('');
  const [settingsOpenaiModel, setSettingsOpenaiModel] = useState('');
  const [settingsGoogleApiKey, setSettingsGoogleApiKey] = useState('');
  const [settingsOpenaiApiKey, setSettingsOpenaiApiKey] = useState('');
  const [geminiModelSelect, setGeminiModelSelect] = useState('gemini-3.1-flash-live-preview');
  const [geminiModelCustom, setGeminiModelCustom] = useState('');
  const [openaiModelSelect, setOpenaiModelSelect] = useState('gpt-realtime-2');
  const [openaiModelCustom, setOpenaiModelCustom] = useState('');
  const [geminiSaveMsg, setGeminiSaveMsg] = useState('');
  const [openaiSaveMsg, setOpenaiSaveMsg] = useState('');
  // Evaluation model (used by the LLM-judge evaluator)
  const [evaluationModel, setEvaluationModel] = useState('gemini-3.1-flash-lite');
  const [evaluationProvider, setEvaluationProvider] = useState('gemini');
  const [evaluationModelSelect, setEvaluationModelSelect] = useState('gemini-3.1-flash-lite');
  const [evaluationModelCustom, setEvaluationModelCustom] = useState('');
  // Sub-tab within Model Configuration
  const [modelConfigSubTab, setModelConfigSubTab] = useState('api_keys');
  // TTS configuration for synthesizing user-utterance audio
  const [ttsEngine, setTtsEngine] = useState('local');
  const [openaiTtsModel, setOpenaiTtsModel] = useState('tts-1');
  const [openaiTtsVoice, setOpenaiTtsVoice] = useState('nova');
  const [googleTtsVoice, setGoogleTtsVoice] = useState('en-US-Journey-F');
  const [googleTtsVoiceSelect, setGoogleTtsVoiceSelect] = useState('en-US-Journey-F');
  const [googleTtsVoiceCustom, setGoogleTtsVoiceCustom] = useState('');
  const [ttsEngineAvailable, setTtsEngineAvailable] = useState({ openai: false, google: false, local: false });
  const [advancedSaveMsg, setAdvancedSaveMsg] = useState('');
  const [settingsUtterances, setSettingsUtterances] = useState([]);
  const [rawArgsState, setRawArgsState] = useState({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [utterancesSaveMsg, setUtterancesSaveMsg] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  // templates moved to useTemplates hook
  const [verifyingProvider, setVerifyingProvider] = useState(null);
  const [geminiVerifiedStatus, setGeminiVerifiedStatus] = useState(null);
  const [openaiVerifiedStatus, setOpenaiVerifiedStatus] = useState(null);
  
  // Detailed Run Inspection
  const [selectedRunId, setSelectedRunId] = useState(null);
  const [selectedRunData, setSelectedRunData] = useState(null);
  
  // States for comparing two runs
  const [compareSelection, setCompareSelection] = useState([]);
  const [activeComparison, setActiveComparison] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  // Modal for adding/editing an utterance
  const [isAddUtteranceModalOpen, setIsAddUtteranceModalOpen] = useState(false);
  const [editingUtteranceIdx, setEditingUtteranceIdx] = useState(null);
  const [newUtteranceId, setNewUtteranceId] = useState('');
  const [newUtteranceText, setNewUtteranceText] = useState('');
  const [newUtteranceExpectType, setNewUtteranceExpectType] = useState('none');
  const [newUtterancePhrases, setNewUtterancePhrases] = useState('');
  const [newUtteranceTool, setNewUtteranceTool] = useState('');
  const [newUtteranceArgs, setNewUtteranceArgs] = useState('');
  const [newUtteranceBehaviorType, setNewUtteranceBehaviorType] = useState('sequential');
  const [newUtteranceBargeInDelay, setNewUtteranceBargeInDelay] = useState(600);
  const [newUtteranceExpectInterrupted, setNewUtteranceExpectInterrupted] = useState(false);

  // Runs table search & sorting
  const [runsSearchQuery, setRunsSearchQuery] = useState('');
  const [runsSortField, setRunsSortField] = useState('created_at');
  const [runsSortDirection, setRunsSortDirection] = useState('desc');

  // Settings sub-tab navigation
  const [settingsSubTab, setSettingsSubTab] = useState('models');
  const [modelProviderTab, setModelProviderTab] = useState('gemini');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [confirmModalConfig, setConfirmModalConfig] = useState(null);


  const selectedRunIdRef = useRef(null);
  const activeComparisonRef = useRef(null);

  useEffect(() => {
    selectedRunIdRef.current = selectedRunId;
  }, [selectedRunId]);

  useEffect(() => {
    activeComparisonRef.current = activeComparison;
  }, [activeComparison]);

  const handleTriggerComparison = useCallback((runId1, runId2) => {
    setLoadingComparison(true);
    Promise.all([
      fetch(`${backendUrl}/api/runs/${runId1}`).then((res) => res.json()),
      fetch(`${backendUrl}/api/runs/${runId2}`).then((res) => res.json())
    ])
      .then(([run1, run2]) => {
        setActiveComparison({ run1, run2 });
        setLoadingComparison(false);
      })
      .catch((err) => {
        console.error('Error fetching runs for comparison:', err);
        setLoadingComparison(false);
        alert('Failed to load runs for comparison.');
      });
  }, []);

  const backendUrl = ''; // Relative path for proxy or served directly

  const { backendConfig, setBackendConfig, backendStatus, refreshBackendConfig } =
    useBackendConfig(backendUrl, {
      onConfigLoaded: (data) => {
        if (data?.gemini_model && selectedProvider === 'gemini') {
          setSelectedModel(data.gemini_model);
        }
      },
    });
  const { runs, setRuns, refreshRuns } = useRuns(backendUrl);
  const { templates, setTemplates, refreshTemplates } = useTemplates(backendUrl);

  // Effect to load detailed run when selected
  useEffect(() => {
    if (!selectedRunId) {
      setSelectedRunData(null);
      return;
    }
    fetch(`${backendUrl}/api/runs/${selectedRunId}`)
      .then((res) => res.json())
      .then((data) => setSelectedRunData(data))
      .catch((err) => console.error('Error fetching run details:', err));
  }, [selectedRunId]);

  // Synchronize hash state with tab/inspect/compare states
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash || '#/dashboard';
      if (hash.startsWith('#/launcher') || hash.startsWith('#/metrics')) {
        window.location.hash = '#/dashboard';
        return;
      }
      if (hash.startsWith('#/history')) {
        window.location.hash = hash.replace('#/history', '#/runs');
        return;
      }
      
      if (hash.startsWith('#/dashboard')) {
        setActiveTab('dashboard');
        setSelectedRunId(null);
        setActiveComparison(null);
      } else if (hash.startsWith('#/settings')) {
        setActiveTab('settings');
        setSelectedRunId(null);
        setActiveComparison(null);
      } else if (hash.startsWith('#/runs')) {
        setActiveTab('runs');
        const parts = hash.split('/');
        if (parts[2] === 'inspect' && parts[3]) {
          setSelectedRunId(parts[3]);
          setActiveComparison(null);
        } else if (parts[2] === 'compare' && parts[3] && parts[4]) {
          setSelectedRunId(null);
          handleTriggerComparison(parts[3], parts[4]);
        } else {
          setSelectedRunId(null);
          setActiveComparison(null);
          setCompareSelection([]);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleTriggerComparison]);

  // Backend config, runs, and templates are loaded via hooks above.
  // Utterances JSON is the only remaining mount-time fetch.
  useEffect(() => {
    fetch(`${backendUrl}/api/utterances/json`)
      .then((res) => res.json())
      .then((data) => {
        setSettingsUtterances(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setNumTurns(data.length);
        }
      })
      .catch((err) => console.error('Error fetching utterances:', err));
  }, []);

  useEffect(() => {
    if (backendConfig?.active_template) {
      setSelectedTemplateId(backendConfig.active_template);
    }
  }, [backendConfig]);

  const [runningId, setRunningId] = useState(null);
  const [runStatus, setRunStatus] = useState(null);
  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: 'Ready to launch. Select a provider and click "Start Scripted Run".' }
  ]);

  const logsEndRef = useRef(null);
  const lastPollMsgRef = useRef('');

  const addLog = (text) => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString(), text }]);
  };

  // Like addLog, but skips re-logging the exact same status line on consecutive polls.
  const addPollLog = (text) => {
    if (text === lastPollMsgRef.current) return;
    lastPollMsgRef.current = text;
    addLog(text);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [logs]);

  const pollRunStatus = (runId) => {
    fetch(`${backendUrl}/api/runs/${runId}`)
      .then((res) => res.json())
      .then((data) => {
        setRunStatus(data.status);
        if (selectedRunIdRef.current === runId) {
          setSelectedRunData(data);
        }
        if (data.status === 'completed' || data.status === 'failed') {
          addLog(`Run ${data.status.toUpperCase()}!`);
          setRunningId(null);
          // Refresh runs list
          fetch(`${backendUrl}/api/runs`)
            .then((res) => res.json())
            .then((d) => setRuns(d));
        } else {
          const turns = data.turns || [];
          const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;
          const turnNum = turns.length;

          let logMsg;
          if (!lastTurn) {
            logMsg = `Status: ${data.status.toUpperCase()}. Waiting for the first turn to start...`;
          } else if (lastTurn.audio_completed_received_at == null) {
            // Turn is in flight
            if (!lastTurn.first_audio_received_at) {
              logMsg = `Turn ${turnNum} (${lastTurn.utterance_id}): sent to agent — "${lastTurn.text_input.slice(0, 50)}" — awaiting response...`;
            } else {
              logMsg = `Turn ${turnNum} (${lastTurn.utterance_id}): receiving response (TTFA ${Math.round(lastTurn.time_to_first_audio_ms)}ms)`;
              if (lastTurn.transcript_output) {
                logMsg += ` — "${lastTurn.transcript_output.slice(0, 60)}"`;
              }
            }
          } else {
            // Turn finished
            logMsg = `Turn ${turnNum} (${lastTurn.utterance_id}) complete`;
            if (lastTurn.transcript_output) {
              logMsg += ` — received: "${lastTurn.transcript_output.slice(0, 60)}"`;
            }
            if (lastTurn.time_to_first_audio_ms != null) {
              logMsg += ` | TTFA: ${Math.round(lastTurn.time_to_first_audio_ms)}ms`;
            }
            if (lastTurn.tool_call_details) {
              const tc = lastTurn.tool_call_details;
              logMsg += ` | tool: ${tc.name}${tc.latency_ms != null ? ` (${Math.round(tc.latency_ms)}ms)` : ''}`;
            }
          }
          addPollLog(logMsg);
          // Continue polling
          setTimeout(() => pollRunStatus(runId), 2000);
        }
      })
      .catch((err) => {
        console.error('Error polling run:', err);
        setRunningId(null);
      });
  };

  const pollCompareStatus = (geminiRunId, openaiRunId) => {
    // Snapshot the run-id pair this poll is for; if the user navigates away
    // (activeComparison changes or compareRunIds is cleared) we stop polling.
    const pairKey = `${geminiRunId}::${openaiRunId}`;
    Promise.all([
      fetch(`${backendUrl}/api/runs/${geminiRunId}`).then((res) => res.json()),
      fetch(`${backendUrl}/api/runs/${openaiRunId}`).then((res) => res.json())
    ])
      .then(([geminiData, openaiData]) => {
        const active = activeComparisonRef.current;
        const stillOnSamePair =
          active &&
          active.run1.run_id === geminiRunId &&
          active.run2.run_id === openaiRunId;

        const isDone = (d) => d.status === 'completed' || d.status === 'failed';
        const summarize = (label, d) => `${label}: ${d.status?.toUpperCase()} (turns: ${d.turns ? d.turns.length : 0})`;
        addLog(`${summarize('Gemini', geminiData)} | ${summarize('OpenAI', openaiData)}`);

        if (stillOnSamePair) {
          setActiveComparison({ run1: geminiData, run2: openaiData });
        }

        if (isDone(geminiData) && isDone(openaiData)) {
          addLog('Both comparison runs finished.');
          setCompareData({ gemini: geminiData, openai: openaiData });
          setCompareRunIds(null);
          fetch(`${backendUrl}/api/runs`)
            .then((res) => res.json())
            .then((d) => setRuns(d));
        } else if (stillOnSamePair) {
          // Only re-arm the poll if the user is still on this comparison.
          setTimeout(() => pollCompareStatus(geminiRunId, openaiRunId), 2000);
        } else {
          addLog(`Stopped polling ${pairKey} (user navigated away).`);
        }
      })
      .catch((err) => {
        console.error('Error polling comparison runs:', err);
        setCompareRunIds(null);
      });
  };

  const handleStartRun = () => {
    if (runningId || compareRunIds) return;

    setLogs([]);
    lastPollMsgRef.current = '';
    setCompareData(null);

    if (runBothInParallel) {
      const geminiModel = backendConfig?.gemini_model || 'gemini-3.1-flash-live-preview';
      const openaiModel = backendConfig?.openai_model || 'gpt-realtime-2';
      addLog(`Requesting parallel comparison run: gemini (${geminiModel}) vs openai (${openaiModel}), ${numTurns} turns each...`);

      fetch(`${backendUrl}/api/run/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          models: { gemini: geminiModel, openai: openaiModel },
          transport: selectedTransport,
          num_turns: numTurns
        })
      })
        .then((res) => res.json())
        .then((data) => {
          const gid = data.run_ids?.gemini;
          const oid = data.run_ids?.openai;
          if (gid && oid) {
            setCompareRunIds({ gemini: gid, openai: oid });
            addLog(`Comparison runs started. Gemini: ${gid}, OpenAI: ${oid}`);
            pollCompareStatus(gid, oid);
            
            // Navigate to Runs compare page
            setIsNewRunModalOpen(false);
            window.location.hash = `#/runs/compare/${gid}/${oid}`;
          } else {
            addLog(`Failed to start comparison run: ${data.detail || 'unknown error'}`);
          }
        })
        .catch((err) => {
          addLog(`Connection error: ${err.message}`);
        });
      return;
    }

    const effectiveModel = selectedProvider === 'gemini'
      ? selectedModel
      : (selectedModel && !selectedModel.startsWith('gemini-')
          ? selectedModel
          : (backendConfig?.openai_model || 'gpt-4o-realtime-preview'));

    addLog(`Requesting new run for ${selectedProvider} (${effectiveModel}), ${numTurns} turns...`);

    fetch(`${backendUrl}/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: selectedProvider,
        model: effectiveModel,
        transport: selectedTransport,
        num_turns: numTurns
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.run_id) {
          setRunningId(data.run_id);
          addLog(`Run started in background. ID: ${data.run_id}`);
          pollRunStatus(data.run_id);

          // Navigate to Runs inspect page
          setIsNewRunModalOpen(false);
          window.location.hash = `#/runs/inspect/${data.run_id}`;
        } else {
          addLog(`Failed to start run: ${data.detail || 'unknown error'}`);
        }
      })
      .catch((err) => {
        addLog(`Connection error: ${err.message}`);
      });
  };

  const handleStopRun = () => {
    if (compareRunIds) {
      addLog(`Requesting stop for comparison runs ${compareRunIds.gemini} / ${compareRunIds.openai}...`);
      Promise.all([
        fetch(`${backendUrl}/api/run/${compareRunIds.gemini}/stop`, { method: 'POST' }),
        fetch(`${backendUrl}/api/run/${compareRunIds.openai}/stop`, { method: 'POST' })
      ])
        .then(() => addLog('Stop request sent successfully.'))
        .catch((err) => addLog(`Error requesting stop: ${err.message}`));
      return;
    }

    if (!runningId) return;

    addLog(`Requesting stop for run ${runningId}...`);

    fetch(`${backendUrl}/api/run/${runningId}/stop`, {
      method: 'POST'
    })
      .then((res) => {
        if (res.ok) {
          addLog(`Stop request sent successfully.`);
        } else {
          addLog(`Failed to stop run: server returned status ${res.status}`);
        }
      })
      .catch((err) => {
        addLog(`Error requesting stop: ${err.message}`);
      });
  };

  useEffect(() => {
    if (activeTab !== 'settings' || settingsLoaded) return;

    Promise.all([
      fetch(`${backendUrl}/api/settings`).then((res) => res.json()),
      fetch(`${backendUrl}/api/utterances/json`).then((res) => res.json())
    ])
      .then(([settingsData, utterancesData]) => {
        setSettingsGoogleApiKey(settingsData.google_api_key || '');
        setSettingsOpenaiApiKey(settingsData.openai_api_key || '');

        if (settingsData.google_api_key === '••••••••') {
          setGeminiVerifiedStatus({ success: true, message: 'Google Gemini API key verified (previously saved).' });
        }
        if (settingsData.openai_api_key === '••••••••') {
          setOpenaiVerifiedStatus({ success: true, message: 'OpenAI API key verified (previously saved).' });
        }

        const gModel = settingsData.gemini_model || '';
        if (gModel === '' || ['gemini-3.1-flash-live-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-8b', 'gemini-2.0-flash-exp'].includes(gModel)) {
          setGeminiModelSelect(gModel || 'gemini-3.1-flash-live-preview');
          setGeminiModelCustom('');
        } else {
          setGeminiModelSelect('custom');
          setGeminiModelCustom(gModel);
        }

        const oModel = settingsData.openai_model || '';
        if (oModel === '' || ['gpt-realtime-2', 'gpt-4o-realtime-preview', 'gpt-4o-mini-realtime-preview'].includes(oModel)) {
          setOpenaiModelSelect(oModel || 'gpt-realtime-2');
          setOpenaiModelCustom('');
        } else {
          setOpenaiModelSelect('custom');
          setOpenaiModelCustom(oModel);
        }

        // Advanced: evaluation model + TTS
        const evalProv = settingsData.evaluation_provider || 'gemini';
        setEvaluationProvider(evalProv);
        const evalModel = settingsData.evaluation_model || '';
        setEvaluationModel(evalModel);
        if (evalProv === 'gemini') {
          if (evalModel === '' || ['gemini-3.1-flash-lite', 'gemini-2.5-flash'].includes(evalModel)) {
            setEvaluationModelSelect(evalModel || 'gemini-3.1-flash-lite');
            setEvaluationModelCustom('');
          } else {
            setEvaluationModelSelect('custom');
            setEvaluationModelCustom(evalModel);
          }
        } else {
          if (evalModel === '' || ['gpt-4o-mini', 'gpt-4o'].includes(evalModel)) {
            setEvaluationModelSelect(evalModel || 'gpt-4o-mini');
            setEvaluationModelCustom('');
          } else {
            setEvaluationModelSelect('custom');
            setEvaluationModelCustom(evalModel);
          }
        }
        if (settingsData.tts_engine) setTtsEngine(settingsData.tts_engine);
        if (settingsData.openai_tts_model) setOpenaiTtsModel(settingsData.openai_tts_model);
        if (settingsData.openai_tts_voice) setOpenaiTtsVoice(settingsData.openai_tts_voice);
        if (settingsData.google_tts_voice) {
          const gVoice = settingsData.google_tts_voice;
          setGoogleTtsVoice(gVoice);
          if (['en-US-Journey-F', 'en-US-Journey-D', 'en-US-Wavenet-F', 'en-US-Wavenet-D', 'en-US-Neutral-A', 'en-US-News-K'].includes(gVoice)) {
            setGoogleTtsVoiceSelect(gVoice);
            setGoogleTtsVoiceCustom('');
          } else {
            setGoogleTtsVoiceSelect('custom');
            setGoogleTtsVoiceCustom(gVoice);
          }
        }
        if (settingsData.tts_engine_available) setTtsEngineAvailable(settingsData.tts_engine_available);

        const rawArgs = {};
        if (Array.isArray(utterancesData)) {
          utterancesData.forEach((u, idx) => {
            rawArgs[idx] = u.expect?.args ? JSON.stringify(u.expect.args) : '';
          });
        }
        setRawArgsState(rawArgs);

        setSettingsUtterances(Array.isArray(utterancesData) ? utterancesData : []);
        setSettingsLoaded(true);
      })
      .catch((err) => console.error('Error loading settings:', err));
  }, [activeTab, settingsLoaded]);

  useEffect(() => {
    if (backendConfig?.active_template) {
      setSelectedTemplateId(backendConfig.active_template);
    }
  }, [backendConfig]);

  const handleSaveEvaluationSettings = () => {
    setAdvancedSaveMsg('Saving...');
    const geminiModel = geminiModelSelect === 'custom' ? geminiModelCustom : geminiModelSelect;
    const openaiModel = openaiModelSelect === 'custom' ? openaiModelCustom : openaiModelSelect;
    const evalModel = evaluationModelSelect === 'custom' ? evaluationModelCustom : evaluationModelSelect;
    fetch(`${backendUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gemini_model: geminiModel,
        openai_model: openaiModel,
        evaluation_model: evalModel,
        evaluation_provider: evaluationProvider,
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save evaluation settings');
        return res.json();
      })
      .then(() => {
        setEvaluationModel(evalModel);
        setAdvancedSaveMsg('Saved.');
        setTimeout(() => setAdvancedSaveMsg(''), 2000);
      })
      .catch((err) => setAdvancedSaveMsg(`Error: ${err.message}`));
  };

  const handleSaveTtsSettings = () => {
    setAdvancedSaveMsg('Saving...');
    const geminiModel = geminiModelSelect === 'custom' ? geminiModelCustom : geminiModelSelect;
    const openaiModel = openaiModelSelect === 'custom' ? openaiModelCustom : openaiModelSelect;
    const gVoice = googleTtsVoiceSelect === 'custom' ? googleTtsVoiceCustom : googleTtsVoiceSelect;
    fetch(`${backendUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gemini_model: geminiModel,
        openai_model: openaiModel,
        tts_engine: ttsEngine,
        openai_tts_model: openaiTtsModel,
        openai_tts_voice: openaiTtsVoice,
        google_tts_voice: gVoice,
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save TTS settings');
        return res.json();
      })
      .then(() => {
        setGoogleTtsVoice(gVoice);
        setAdvancedSaveMsg('Saved.');
        setTimeout(() => setAdvancedSaveMsg(''), 2000);
      })
      .catch((err) => setAdvancedSaveMsg(`Error: ${err.message}`));
  };

  const handleSaveModelSettings = (provider) => {
    const isGemini = provider === 'gemini';
    const setMsg = isGemini ? setGeminiSaveMsg : setOpenaiSaveMsg;
    setMsg('Saving...');

    const geminiModel = geminiModelSelect === 'custom' ? geminiModelCustom : geminiModelSelect;
    const openaiModel = openaiModelSelect === 'custom' ? openaiModelCustom : openaiModelSelect;

    fetch(`${backendUrl}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gemini_model: geminiModel,
        openai_model: openaiModel,
        google_api_key: isGemini ? settingsGoogleApiKey : '••••••••',
        openai_api_key: !isGemini ? settingsOpenaiApiKey : '••••••••'
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save settings');
        return res.json();
      })
      .then(() => {
        setMsg('Saved.');
        if (provider === 'gemini') {
          setGeminiVerifiedStatus({ success: true, message: 'Google Gemini API key saved & active.' });
        } else {
          setOpenaiVerifiedStatus({ success: true, message: 'OpenAI API key saved & active.' });
        }
        fetch(`${backendUrl}/api/status`)
          .then((res) => res.json())
          .then((cfg) => setBackendConfig(cfg))
          .catch((e) => console.error('Error updating config status:', e));
        setTimeout(() => setMsg(''), 2000);
      })
      .catch((err) => setMsg(`Error: ${err.message}`));
  };

  const handleSaveUtterances = () => {
    setUtterancesSaveMsg('Saving...');
    fetch(`${backendUrl}/api/utterances/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utterances: settingsUtterances })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save utterances');
        return res.json();
      })
      .then((data) => {
        setUtterancesSaveMsg(`Saved (${data.count} utterances).`);
        setTimeout(() => setUtterancesSaveMsg(''), 3000);
        
        // Refresh status configuration to update active template (which shifts to "custom")
        fetch(`${backendUrl}/api/status`)
          .then((res) => res.json())
          .then((cfg) => setBackendConfig(cfg))
          .catch((e) => console.error('Error updating status:', e));
      })
      .catch((err) => setUtterancesSaveMsg(`Error: ${err.message}`));
  };

  const handleLoadTemplate = (templateId) => {
    executeLoadTemplate(templateId);
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      alert('Please provide a template name.');
      return;
    }
    if (!newTemplateFirstMessage.trim()) {
      alert('Please provide the first message for the template.');
      return;
    }

    const activeTemplateId = backendConfig?.active_template || 'restaurant';
    const body = {
      name: newTemplateName,
      description: newTemplateDesc,
      first_message: newTemplateFirstMessage,
    };

    if (newTemplateMode === 'clone') {
      body.copy_from_template_id = activeTemplateId;
    } else {
      // From scratch — send explicit system_prompt and tools so the backend
      // does NOT silently inherit the active template's agent.
      let parsedTools;
      try {
        parsedTools = JSON.parse(newTemplateToolsJson || '[]');
        if (!Array.isArray(parsedTools)) throw new Error('Tools must be a JSON array');
      } catch (e) {
        alert(`Tools JSON is invalid: ${e.message}`);
        return;
      }
      if (!newTemplateSystemPrompt.trim()) {
        alert('Please provide a system prompt (or switch to "Clone from current").');
        return;
      }
      body.system_prompt = newTemplateSystemPrompt;
      body.tools = parsedTools;
    }

    fetch(`${backendUrl}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create template');
        return res.json();
      })
      .then(data => {
        setUtterancesSaveMsg(`Template "${newTemplateName}" created.`);
        setIsAddTemplateModalOpen(false);
        setNewTemplateName('');
        setNewTemplateDesc('');
        setNewTemplateFirstMessage('');
        
        // Refresh templates list and load the newly created template
        fetch(`${backendUrl}/api/templates`)
          .then(res => res.json())
          .then(templatesData => {
            setTemplates(Array.isArray(templatesData) ? templatesData : []);
            if (data.template_id) {
              executeLoadTemplate(data.template_id);
            }
          });
        setTimeout(() => setUtterancesSaveMsg(''), 3000);
      })
      .catch(err => alert(err.message));
  };

  const handleUpdateTemplateMetadata = () => {
    if (!editTemplateName.trim()) {
      alert('Please provide a template name.');
      return;
    }

    let parsedTools;
    try {
      parsedTools = JSON.parse(editTemplateToolsJson || '[]');
      if (!Array.isArray(parsedTools)) throw new Error('Tools must be a JSON array');
    } catch (e) {
      alert(`Tools JSON is invalid: ${e.message}`);
      return;
    }
    if (!editTemplateSystemPrompt.trim()) {
      alert('System prompt cannot be empty.');
      return;
    }

    const targetId = editTemplateOriginalId || backendConfig?.active_template;
    if (!targetId) {
      alert('No template selected to edit.');
      return;
    }
    const refreshAll = (newId) => {
      fetch(`${backendUrl}/api/templates`)
        .then(res => res.json())
        .then(templatesData => {
          setTemplates(Array.isArray(templatesData) ? templatesData : []);
          if (newId) executeLoadTemplate(newId);
        });
      fetch(`${backendUrl}/api/status`)
        .then(res => res.json())
        .then(cfg => setBackendConfig(cfg));
    };

    // Built-ins and customs are now both editable in-place. Reset All Data
    // restores built-ins to their seeded form.
    Promise.all([
      fetch(`${backendUrl}/api/templates/${targetId}/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTemplateName, description: editTemplateDesc })
      }),
      fetch(`${backendUrl}/api/templates/${targetId}/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system_prompt: editTemplateSystemPrompt, tools: parsedTools })
      })
    ])
      .then(async ([metaRes, agentRes]) => {
        if (!metaRes.ok) throw new Error('Failed to update template metadata');
        if (!agentRes.ok) throw new Error('Failed to update template agent');
        setUtterancesSaveMsg(`Template "${editTemplateName}" updated.`);
        setIsEditTemplateModalOpen(false);
        refreshAll(targetId);
        setTimeout(() => setUtterancesSaveMsg(''), 3000);
      })
      .catch(err => alert(err.message));
  };

  const handleSaveUtterance = () => {
    if (!newUtteranceId.trim()) {
      alert('Please provide a Turn ID.');
      return;
    }
    if (!newUtteranceText.trim()) {
      alert('Please provide prompt text.');
      return;
    }

    const newUtt = {
      id: newUtteranceId.trim(),
      text: newUtteranceText.trim(),
    };

    if (newUtteranceExpectType === 'phrases') {
      const phrases = newUtterancePhrases
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      newUtt.expect = { ...newUtt.expect, response_contains: phrases };
    } else if (newUtteranceExpectType === 'tool') {
      let parsedArgs = {};
      if (newUtteranceArgs.trim()) {
        try {
          parsedArgs = JSON.parse(newUtteranceArgs);
        } catch (e) {
          alert('Invalid JSON in expected arguments. Please correct it or leave it empty.');
          return;
        }
      }
      newUtt.expect = {
        ...newUtt.expect,
        tool: newUtteranceTool.trim(),
        args: parsedArgs,
      };
    }

    if (newUtteranceExpectInterrupted) {
      newUtt.expect = { ...newUtt.expect, interrupted: true };
    }

    if (newUtteranceBehaviorType === 'barge_in') {
      newUtt.behavior = { type: 'barge_in', delay_ms: newUtteranceBargeInDelay };
    }

    let updated;
    if (editingUtteranceIdx !== null) {
      updated = [...settingsUtterances];
      updated[editingUtteranceIdx] = newUtt;
    } else {
      updated = [...settingsUtterances, newUtt];
    }

    fetch(`${backendUrl}/api/utterances/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utterances: updated })
    })
      .then(res => res.json())
      .then(() => {
        setSettingsUtterances(updated);
        setIsAddUtteranceModalOpen(false);
        setUtterancesSaveMsg(editingUtteranceIdx !== null ? 'Utterance updated.' : 'Utterance added.');
        setTimeout(() => setUtterancesSaveMsg(''), 3000);

        fetch(`${backendUrl}/api/status`)
          .then((res) => res.json())
          .then((cfg) => setBackendConfig(cfg));
      })
      .catch(err => alert(`Failed to save: ${err.message}`));
  };

  const handleDeleteTemplate = () => {
    if (!editTemplateOriginalId) return;
    const warning = editTemplateIsBuiltin
      ? `Delete built-in template "${editTemplateName}"? You can bring it back via Reset All Data in the Danger Zone.`
      : `Delete template "${editTemplateName}"? This cannot be undone.`;
    if (!window.confirm(warning)) return;
    fetch(`${backendUrl}/api/templates/${editTemplateOriginalId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete template');
        return res.json();
      })
      .then(() => {
        setUtterancesSaveMsg(`Template deleted.`);
        setIsEditTemplateModalOpen(false);
        fetch(`${backendUrl}/api/templates`)
          .then(res => res.json())
          .then(templatesData => {
            setTemplates(Array.isArray(templatesData) ? templatesData : []);
            executeLoadTemplate('restaurant');
          });
        setTimeout(() => setUtterancesSaveMsg(''), 3000);
      })
      .catch(err => alert(err.message));
  };

  const executeLoadTemplate = (templateId) => {
    setUtterancesSaveMsg('Loading template...');
    fetch(`${backendUrl}/api/templates/${templateId}/load`, {
      method: 'POST'
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load template');
        return res.json();
      })
      .then((data) => {
        // Refresh utterances state
        fetch(`${backendUrl}/api/utterances/json`)
          .then((res) => res.json())
          .then((uttData) => {
            const rawArgs = {};
            if (Array.isArray(uttData)) {
              uttData.forEach((u, idx) => {
                rawArgs[idx] = u.expect?.args ? JSON.stringify(u.expect.args) : '';
              });
            }
            setRawArgsState(rawArgs);
            setSettingsUtterances(Array.isArray(uttData) ? uttData : []);
            
            // Adjust turns count dynamically to match the newly loaded template size
            if (Array.isArray(uttData) && uttData.length > 0) {
              setNumTurns(uttData.length);
            }

            setUtterancesSaveMsg(`Loaded template successfully.`);
            setTimeout(() => setUtterancesSaveMsg(''), 3000);

            // Refresh status configuration to update active template name
            fetch(`${backendUrl}/api/status`)
              .then((res) => res.json())
              .then((cfg) => setBackendConfig(cfg))
              .catch((e) => console.error('Error updating status:', e));
          });
      })
      .catch((err) => {
        setUtterancesSaveMsg(`Error loading template: ${err.message}`);
      });
  };

  const handleVerifyKey = (provider) => {
    const isGemini = provider === 'gemini';
    const key = isGemini ? settingsGoogleApiKey : settingsOpenaiApiKey;
    const setStatus = isGemini ? setGeminiVerifiedStatus : setOpenaiVerifiedStatus;
    
    setVerifyingProvider(provider);
    setStatus(null);

    fetch(`${backendUrl}/api/settings/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: provider,
        api_key: key
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus({ success: true, message: data.message });
        } else {
          setStatus({ success: false, message: data.detail || 'Failed to verify key.' });
        }
        setVerifyingProvider(null);
      })
      .catch((err) => {
        setStatus({ success: false, message: `Connection error: ${err.message}` });
        setVerifyingProvider(null);
      });
  };

  const updateUtteranceField = (index, field, value) => {
    const updated = [...settingsUtterances];
    updated[index] = { ...updated[index], [field]: value };
    setSettingsUtterances(updated);
  };

  const updateUtteranceExpectType = (index, type) => {
    const updated = [...settingsUtterances];
    const current = updated[index];
    if (type === 'none') {
      const { expect, ...rest } = current;
      updated[index] = rest;
    } else if (type === 'phrases') {
      // response_contains: list of substrings — promote a legacy response string if present
      const existing = Array.isArray(current.expect?.response_contains)
        ? current.expect.response_contains
        : (current.expect?.response ? [current.expect.response] : []);
      updated[index] = { ...current, expect: { response_contains: existing } };
    } else if (type === 'tool') {
      updated[index] = {
        ...current,
        expect: {
          tool: current.expect?.tool || '',
          args: current.expect?.args || {},
          // preserve response_contains across type switch if user already had one
          ...(Array.isArray(current.expect?.response_contains) ? { response_contains: current.expect.response_contains } : {}),
        },
      };
    }
    setSettingsUtterances(updated);
  };

  const updateUtteranceExpectField = (index, field, value) => {
    const updated = [...settingsUtterances];
    const current = updated[index];
    updated[index] = {
      ...current,
      expect: {
        ...current.expect,
        [field]: value
      }
    };
    setSettingsUtterances(updated);
  };

  const updateUtteranceBehavior = (index, type) => {
    const updated = [...settingsUtterances];
    const current = updated[index];
    if (type === 'sequential') {
      const { behavior, ...rest } = current;
      updated[index] = rest;
    } else {
      updated[index] = {
        ...current,
        behavior: { type, delay_ms: current.behavior?.delay_ms ?? 600 },
      };
    }
    setSettingsUtterances(updated);
  };

  const updateUtteranceBehaviorField = (index, field, value) => {
    const updated = [...settingsUtterances];
    const current = updated[index];
    updated[index] = {
      ...current,
      behavior: { ...current.behavior, [field]: value },
    };
    setSettingsUtterances(updated);
  };

  const handleArgsChange = (index, textValue) => {
    setRawArgsState((prev) => ({ ...prev, [index]: textValue }));
    try {
      const parsed = JSON.parse(textValue);
      updateUtteranceExpectField(index, 'args', parsed);
    } catch (e) {
      // Invalid JSON is fine while typing
    }
  };

  const handleDeleteRun = (runId) => {
    setConfirmModalConfig({
      title: 'Delete Experiment Run?',
      message: 'Are you sure you want to permanently delete this experiment run? This will delete all transcripts, metrics, and audio files from disk. This cannot be undone.',
      isDanger: true,
      onConfirm: () => executeDeleteRun(runId)
    });
  };

  const executeDeleteRun = (runId) => {
    fetch(`${backendUrl}/api/runs/${runId}`, {
      method: 'DELETE'
    })
      .then((res) => {
        if (res.ok) {
          if (selectedRunId === runId) {
            setSelectedRunId(null);
            window.location.hash = '#/runs';
          }
          // Refresh runs list
          fetch(`${backendUrl}/api/runs`)
            .then((res) => res.json())
            .then((d) => setRuns(d));
        } else {
          alert('Failed to delete run.');
        }
      })
      .catch((err) => {
        console.error('Error deleting run:', err);
        alert(`Error: ${err.message}`);
      });
  };

  const handleSortRuns = (field) => {
    if (runsSortField === field) {
      setRunsSortDirection(runsSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setRunsSortField(field);
      setRunsSortDirection(field === 'created_at' ? 'desc' : 'asc');
    }
  };

  const filteredAndSortedRuns = useMemo(() => {
    let result = [...runs];
    if (runsSearchQuery.trim()) {
      const q = runsSearchQuery.toLowerCase();
      result = result.filter((run) => {
        return (
          (run.run_id && run.run_id.toLowerCase().includes(q)) ||
          (run.provider && run.provider.toLowerCase().includes(q)) ||
          (run.model && run.model.toLowerCase().includes(q)) ||
          (run.transport && run.transport.toLowerCase().includes(q)) ||
          (run.status && run.status.toLowerCase().includes(q))
        );
      });
    }

    if (runsSortField) {
      result.sort((a, b) => {
        let valA = a[runsSortField];
        let valB = b[runsSortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toLowerCase();
        } else if (valA == null) {
          valA = 0;
          valB = valB || 0;
        }

        if (valA < valB) return runsSortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return runsSortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [runs, runsSearchQuery, runsSortField, runsSortDirection]);

  const handleResetDatabase = () => {
    setConfirmModalConfig({
      title: 'Reset All Data?',
      message: 'This will permanently delete ALL run history, transcripts, and audio from disk and reset the SQLite database. This action cannot be undone. Continue?',
      isDanger: true,
      onConfirm: () => executeResetDatabase()
    });
  };

  const executeResetDatabase = () => {
    setResetMsg('Resetting...');
    fetch(`${backendUrl}/api/database/reset`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to reset database.');
        return res.json();
      })
      .then(() => {
        setRuns([]);
        setSelectedRunId(null);
        setSelectedRunData(null);
        window.location.hash = '#/runs';
        setResetMsg('All data has been reset.');
        setTimeout(() => setResetMsg(''), 4000);
      })
      .catch((err) => {
        console.error('Error resetting database:', err);
        setResetMsg(`Error: ${err.message}`);
      });
  };

  const getActivePipelineStep = () => {
    if (!runningId && !compareRunIds) return 0;
    if (logs.length === 0) return 1;
    const lastLog = logs[logs.length - 1]?.text || '';
    if (lastLog.includes('started in background') || lastLog.includes('Waiting for the first turn')) {
      return 1;
    }
    if (lastLog.includes('sent to agent') || lastLog.includes('awaiting response')) {
      return 2;
    }
    if (lastLog.includes('receiving response') || lastLog.includes('receiving')) {
      return 3;
    }
    if (lastLog.includes('complete') || lastLog.includes('Metrics') || lastLog.includes('finished')) {
      return 4;
    }
    return 1;
  };

  const needsApiKeySetup = backendConfig?.providers?.length > 0
    && backendConfig.providers.every((p) => !backendConfig.has_api_key?.[p]);

  const noModelsConfigured = backendConfig && (!backendConfig.gemini_model || !backendConfig.openai_model);

  return (
    <div className="app-container">
      {/* Dynamic Background Glow Orbs */}
      <div className="mesh-gradient-container">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
        <div className="glow-orb glow-orb-3"></div>
      </div>
      <header className="header">
        <div className="header-title">
          <img src={logoUrl} alt="VoxArena" className="header-logo" />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div className="api-status">
            <span className={`status-dot ${backendStatus === 'connected' ? 'connected' : 'disconnected'}`}></span>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>
              {backendStatus === 'connected' ? 'System Online' : 'System Offline'}
            </span>
          </div>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg)' }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className={`sidebar ${sidebarExpanded ? 'expanded' : ''}`}>
          <div className="sidebar-top">
            <nav className="sidebar-nav">
              <button
                className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => { window.location.hash = '#/dashboard'; }}
                title="Dashboard"
                aria-label="Dashboard"
              >
                <LayoutDashboard size={18} />
                {sidebarExpanded && <span className="sidebar-btn-label">Dashboard</span>}
              </button>
              <button
                className={`sidebar-btn ${activeTab === 'runs' ? 'active' : ''}`}
                onClick={() => { window.location.hash = '#/runs'; }}
                title="Benchmark Runs"
                aria-label="Benchmark Runs"
              >
                <History size={18} />
                {sidebarExpanded && <span className="sidebar-btn-label">Runs</span>}
              </button>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <button
              className={`sidebar-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => { window.location.hash = '#/settings'; }}
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} />
              {sidebarExpanded && <span className="sidebar-btn-label">Settings</span>}
            </button>

            <button 
              className="sidebar-toggle-btn"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              aria-label={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              style={{ marginTop: 6 }}
            >
              {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </aside>

        <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardTab
            runs={runs}
            needsApiKeySetup={needsApiKeySetup}
            noModelsConfigured={noModelsConfigured}
            setActiveTab={setActiveTab}
            setIsNewRunModalOpen={setIsNewRunModalOpen}
            setSelectedRunId={setSelectedRunId}
          />
        )}

        {activeTab === 'runs' && (
          <RunsTab
            ctx={{
              loadingComparison, activeComparison, selectedRunId, selectedRunData,
              compareRunIds, runningId,
              logs, logsEndRef,
              runs, runsSearchQuery, runsSortField, runsSortDirection,
              compareSelection, filteredAndSortedRuns,
              setRunsSearchQuery, setIsNewRunModalOpen, setCompareSelection,
              handleDeleteRun, handleSortRuns, getActivePipelineStep,
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            ctx={{
              settingsSubTab, setSettingsSubTab,
              modelConfigSubTab, setModelConfigSubTab,
              settingsGoogleApiKey, setSettingsGoogleApiKey,
              settingsOpenaiApiKey, setSettingsOpenaiApiKey,
              geminiModelSelect, setGeminiModelSelect,
              geminiModelCustom, setGeminiModelCustom,
              openaiModelSelect, setOpenaiModelSelect,
              openaiModelCustom, setOpenaiModelCustom,
              geminiSaveMsg, openaiSaveMsg,
              geminiVerifiedStatus, setGeminiVerifiedStatus,
              openaiVerifiedStatus, setOpenaiVerifiedStatus,
              verifyingProvider,
              handleSaveModelSettings, handleVerifyKey,
              evaluationProvider, setEvaluationProvider,
              evaluationModelSelect, setEvaluationModelSelect,
              evaluationModelCustom, setEvaluationModelCustom,
              advancedSaveMsg,
              handleSaveEvaluationSettings,
              ttsEngine, setTtsEngine,
              openaiTtsModel, setOpenaiTtsModel,
              openaiTtsVoice, setOpenaiTtsVoice,
              googleTtsVoiceSelect, setGoogleTtsVoiceSelect,
              googleTtsVoiceCustom, setGoogleTtsVoiceCustom,
              ttsEngineAvailable,
              handleSaveTtsSettings,
              templates, backendConfig,
              settingsUtterances, setSettingsUtterances,
              setRawArgsState,
              handleLoadTemplate,
              setIsAddTemplateModalOpen,
              setNewTemplateName, setNewTemplateDesc, setNewTemplateFirstMessage,
              setNewTemplateMode, setNewTemplateSystemPrompt, setNewTemplateToolsJson,
              setIsEditTemplateModalOpen,
              setEditTemplateName, setEditTemplateDesc, setEditTemplateSystemPrompt,
              setEditTemplateToolsJson, setEditTemplateIsBuiltin, setEditTemplateOriginalId,
              setIsAddUtteranceModalOpen, setEditingUtteranceIdx,
              setNewUtteranceId, setNewUtteranceText, setNewUtteranceExpectType,
              setNewUtterancePhrases, setNewUtteranceTool, setNewUtteranceArgs,
              setNewUtteranceBehaviorType, setNewUtteranceBargeInDelay, setNewUtteranceExpectInterrupted,
              backendUrl, setUtterancesSaveMsg,
              handleResetDatabase, resetMsg,
            }}
          />
        )}

      </main>
      </div>

      <NewRunModal
        isOpen={isNewRunModalOpen}
        onClose={() => setIsNewRunModalOpen(false)}
        templates={templates}
        backendConfig={backendConfig}
        settingsUtterances={settingsUtterances}
        runBothInParallel={runBothInParallel}
        setRunBothInParallel={setRunBothInParallel}
        selectedProvider={selectedProvider}
        setSelectedProvider={setSelectedProvider}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedTransport={selectedTransport}
        setSelectedTransport={setSelectedTransport}
        numTurns={numTurns}
        setNumTurns={setNumTurns}
        runningId={runningId}
        compareRunIds={compareRunIds}
        executeLoadTemplate={executeLoadTemplate}
        handleStartRun={handleStartRun}
        handleStopRun={handleStopRun}
      />

      <AddUtteranceModal
        isOpen={isAddUtteranceModalOpen}
        onClose={() => setIsAddUtteranceModalOpen(false)}
        templates={templates}
        backendConfig={backendConfig}
        editingIdx={editingUtteranceIdx}
        id={newUtteranceId}
        text={newUtteranceText}
        setText={setNewUtteranceText}
        expectType={newUtteranceExpectType}
        setExpectType={setNewUtteranceExpectType}
        phrases={newUtterancePhrases}
        setPhrases={setNewUtterancePhrases}
        tool={newUtteranceTool}
        setTool={setNewUtteranceTool}
        args={newUtteranceArgs}
        setArgs={setNewUtteranceArgs}
        behaviorType={newUtteranceBehaviorType}
        setBehaviorType={setNewUtteranceBehaviorType}
        bargeInDelay={newUtteranceBargeInDelay}
        setBargeInDelay={setNewUtteranceBargeInDelay}
        expectInterrupted={newUtteranceExpectInterrupted}
        setExpectInterrupted={setNewUtteranceExpectInterrupted}
        onSubmit={handleSaveUtterance}
      />

      <CreateTemplateModal
        isOpen={isAddTemplateModalOpen}
        onClose={() => setIsAddTemplateModalOpen(false)}
        templates={templates}
        backendConfig={backendConfig}
        name={newTemplateName}
        setName={setNewTemplateName}
        description={newTemplateDesc}
        setDescription={setNewTemplateDesc}
        firstMessage={newTemplateFirstMessage}
        setFirstMessage={setNewTemplateFirstMessage}
        mode={newTemplateMode}
        setMode={setNewTemplateMode}
        systemPrompt={newTemplateSystemPrompt}
        setSystemPrompt={setNewTemplateSystemPrompt}
        toolsJson={newTemplateToolsJson}
        setToolsJson={setNewTemplateToolsJson}
        onSubmit={handleCreateTemplate}
      />

      <EditTemplateModal
        isOpen={isEditTemplateModalOpen}
        onClose={() => setIsEditTemplateModalOpen(false)}
        name={editTemplateName}
        setName={setEditTemplateName}
        description={editTemplateDesc}
        setDescription={setEditTemplateDesc}
        systemPrompt={editTemplateSystemPrompt}
        setSystemPrompt={setEditTemplateSystemPrompt}
        toolsJson={editTemplateToolsJson}
        setToolsJson={setEditTemplateToolsJson}
        isBuiltin={editTemplateIsBuiltin}
        onSave={handleUpdateTemplateMetadata}
        onDelete={handleDeleteTemplate}
      />

      {utterancesSaveMsg && (
        <div className="toast-success">
          {utterancesSaveMsg}
        </div>
      )}

      <ConfirmModal
        config={confirmModalConfig}
        onClose={() => setConfirmModalConfig(null)}
      />
    </div>
  );
}

export default App;
