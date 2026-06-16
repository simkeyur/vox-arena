import {
  Cpu, MessageSquare, ShieldAlert, Key, ClipboardCheck, Volume2,
  CheckCircle2, XCircle, Plus, Edit2, Trash2, Target, Zap, ChevronRight, Copy,
} from 'lucide-react';

export default function SettingsTab({ ctx }) {
  const {
    settingsSubTab, setSettingsSubTab,
    modelConfigSubTab, setModelConfigSubTab,
    // Models / API keys
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
    // Evaluation
    evaluationProvider, setEvaluationProvider,
    evaluationModelSelect, setEvaluationModelSelect,
    evaluationModelCustom, setEvaluationModelCustom,
    advancedSaveMsg,
    handleSaveEvaluationSettings,
    // TTS
    ttsEngine, setTtsEngine,
    openaiTtsModel, setOpenaiTtsModel,
    openaiTtsVoice, setOpenaiTtsVoice,
    googleTtsVoiceSelect, setGoogleTtsVoiceSelect,
    googleTtsVoiceCustom, setGoogleTtsVoiceCustom,
    ttsEngineAvailable,
    handleSaveTtsSettings,
    // Utterances / templates
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
    // Danger
    handleResetDatabase, resetMsg,
  } = ctx;

  return (
    <div className="scrollable-tab-container">
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border)', marginBottom: 20, paddingBottom: 8 }}>
        <SubTabButton active={settingsSubTab === 'models'} onClick={() => setSettingsSubTab('models')} icon={Cpu} label="Model Configuration" />
        <SubTabButton active={settingsSubTab === 'utterances'} onClick={() => setSettingsSubTab('utterances')} icon={MessageSquare} label="Utterance Management" />
        <SubTabButton active={settingsSubTab === 'danger'} onClick={() => setSettingsSubTab('danger')} icon={ShieldAlert} label="Danger Zone" />
      </div>

      <div className="setup-banner" style={{
        marginBottom: 16,
        background: 'transparent',
        borderColor: 'var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 12,
        borderRadius: 8,
        padding: '10px 14px',
        borderWidth: 1,
        borderStyle: 'solid',
        opacity: 0.8,
      }}>
        <Zap size={16} style={{ color: '#ffd000', flexShrink: 0 }} />
        <div style={{ color: 'var(--muted)', textAlign: 'left', lineHeight: '1.4', flex: 1 }}>
          <strong style={{ color: 'var(--fg)', fontWeight: 600 }}>Local-Only Storage:</strong> Your API keys and configurations are saved strictly inside your local SQLite database (`runs.db`). They never leave your machine and are only transmitted directly to the official Google Gemini or OpenAI API endpoints during benchmarks.
        </div>
      </div>

      {settingsSubTab === 'models' && (
        <>
          <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border)', marginBottom: 20, paddingBottom: 0 }}>
            <ModelTabButton active={modelConfigSubTab === 'api_keys'} onClick={() => setModelConfigSubTab('api_keys')} icon={Key} label="API Keys" />
            <ModelTabButton active={modelConfigSubTab === 'evaluation'} onClick={() => setModelConfigSubTab('evaluation')} icon={ClipboardCheck} label="Evaluation Config" />
            <ModelTabButton active={modelConfigSubTab === 'tts'} onClick={() => setModelConfigSubTab('tts')} icon={Volume2} label="TTS Config" />
          </div>

          {modelConfigSubTab === 'api_keys' && (
            <ApiKeysSection
              settingsGoogleApiKey={settingsGoogleApiKey} setSettingsGoogleApiKey={setSettingsGoogleApiKey}
              settingsOpenaiApiKey={settingsOpenaiApiKey} setSettingsOpenaiApiKey={setSettingsOpenaiApiKey}
              geminiModelSelect={geminiModelSelect} setGeminiModelSelect={setGeminiModelSelect}
              geminiModelCustom={geminiModelCustom} setGeminiModelCustom={setGeminiModelCustom}
              openaiModelSelect={openaiModelSelect} setOpenaiModelSelect={setOpenaiModelSelect}
              openaiModelCustom={openaiModelCustom} setOpenaiModelCustom={setOpenaiModelCustom}
              geminiSaveMsg={geminiSaveMsg} openaiSaveMsg={openaiSaveMsg}
              geminiVerifiedStatus={geminiVerifiedStatus} setGeminiVerifiedStatus={setGeminiVerifiedStatus}
              openaiVerifiedStatus={openaiVerifiedStatus} setOpenaiVerifiedStatus={setOpenaiVerifiedStatus}
              verifyingProvider={verifyingProvider}
              handleSaveModelSettings={handleSaveModelSettings}
              handleVerifyKey={handleVerifyKey}
            />
          )}

          {modelConfigSubTab === 'evaluation' && (
            <EvaluationSection
              evaluationProvider={evaluationProvider} setEvaluationProvider={setEvaluationProvider}
              evaluationModelSelect={evaluationModelSelect} setEvaluationModelSelect={setEvaluationModelSelect}
              evaluationModelCustom={evaluationModelCustom} setEvaluationModelCustom={setEvaluationModelCustom}
              advancedSaveMsg={advancedSaveMsg}
              handleSaveEvaluationSettings={handleSaveEvaluationSettings}
            />
          )}

          {modelConfigSubTab === 'tts' && (
            <TtsSection
              ttsEngine={ttsEngine} setTtsEngine={setTtsEngine}
              openaiTtsModel={openaiTtsModel} setOpenaiTtsModel={setOpenaiTtsModel}
              openaiTtsVoice={openaiTtsVoice} setOpenaiTtsVoice={setOpenaiTtsVoice}
              googleTtsVoiceSelect={googleTtsVoiceSelect} setGoogleTtsVoiceSelect={setGoogleTtsVoiceSelect}
              googleTtsVoiceCustom={googleTtsVoiceCustom} setGoogleTtsVoiceCustom={setGoogleTtsVoiceCustom}
              ttsEngineAvailable={ttsEngineAvailable}
              advancedSaveMsg={advancedSaveMsg}
              handleSaveTtsSettings={handleSaveTtsSettings}
            />
          )}
        </>
      )}

      {settingsSubTab === 'utterances' && (
        <UtterancesSection
          templates={templates}
          backendConfig={backendConfig}
          settingsUtterances={settingsUtterances}
          setSettingsUtterances={setSettingsUtterances}
          setRawArgsState={setRawArgsState}
          handleLoadTemplate={handleLoadTemplate}
          backendUrl={backendUrl}
          setUtterancesSaveMsg={setUtterancesSaveMsg}
          setIsAddTemplateModalOpen={setIsAddTemplateModalOpen}
          setNewTemplateName={setNewTemplateName}
          setNewTemplateDesc={setNewTemplateDesc}
          setNewTemplateFirstMessage={setNewTemplateFirstMessage}
          setNewTemplateMode={setNewTemplateMode}
          setNewTemplateSystemPrompt={setNewTemplateSystemPrompt}
          setNewTemplateToolsJson={setNewTemplateToolsJson}
          setIsEditTemplateModalOpen={setIsEditTemplateModalOpen}
          setEditTemplateName={setEditTemplateName}
          setEditTemplateDesc={setEditTemplateDesc}
          setEditTemplateSystemPrompt={setEditTemplateSystemPrompt}
          setEditTemplateToolsJson={setEditTemplateToolsJson}
          setEditTemplateIsBuiltin={setEditTemplateIsBuiltin}
          setEditTemplateOriginalId={setEditTemplateOriginalId}
          setIsAddUtteranceModalOpen={setIsAddUtteranceModalOpen}
          setEditingUtteranceIdx={setEditingUtteranceIdx}
          setNewUtteranceId={setNewUtteranceId}
          setNewUtteranceText={setNewUtteranceText}
          setNewUtteranceExpectType={setNewUtteranceExpectType}
          setNewUtterancePhrases={setNewUtterancePhrases}
          setNewUtteranceTool={setNewUtteranceTool}
          setNewUtteranceArgs={setNewUtteranceArgs}
          setNewUtteranceBehaviorType={setNewUtteranceBehaviorType}
          setNewUtteranceBargeInDelay={setNewUtteranceBargeInDelay}
          setNewUtteranceExpectInterrupted={setNewUtteranceExpectInterrupted}
        />
      )}

      {settingsSubTab === 'danger' && (
        <div className="card danger-zone" style={{ margin: 0 }}>
          <div className="card-header">
            <span className="card-title" style={{ color: 'var(--error)' }}>Danger Zone</span>
          </div>
          <div className="card-body">
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              Factory reset: wipes all run history, transcripts, and audio files,
              deletes every custom template, and restores the built-in templates
              to their original state (so any built-ins you've edited or deleted
              come back). API keys and TTS settings are preserved.
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-danger" onClick={handleResetDatabase}>
                Reset All Data
              </button>
              {resetMsg && <span style={{ fontSize: 13, color: 'var(--muted)' }}>{resetMsg}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubTabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: active ? 'var(--fg)' : 'var(--muted)',
        fontWeight: active ? '600' : '500',
        paddingBottom: 8,
        position: 'relative',
        cursor: 'pointer',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <Icon size={16} />
      {label}
      {active && (
        <div style={{ position: 'absolute', bottom: -9, left: 0, right: 0, height: 2, backgroundColor: 'var(--fg)' }} />
      )}
    </button>
  );
}

function ModelTabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
        color: active ? 'var(--fg)' : 'var(--muted)',
        fontWeight: active ? '600' : '500',
        padding: '8px 12px',
        cursor: 'pointer',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ApiKeysSection({
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
}) {
  return (
    <div className="card" style={{ margin: 0 }}>
      <div className="card-header">
        <span className="card-title">API Keys & Realtime Models</span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="runs-table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th style={{ width: 140 }}>Provider</th>
                <th>API Key</th>
                <th>Realtime Model</th>
                <th style={{ width: 100, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, fontSize: 13 }}>Google Gemini</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="password"
                        className="text-input"
                        value={settingsGoogleApiKey}
                        onChange={(e) => {
                          setSettingsGoogleApiKey(e.target.value);
                          setGeminiVerifiedStatus(null);
                        }}
                        placeholder={settingsGoogleApiKey ? '••••••••' : 'Enter Google API Key'}
                        style={{ flex: 1, height: 32, fontSize: 13, margin: 0 }}
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleVerifyKey('gemini')}
                        disabled={verifyingProvider === 'gemini'}
                        style={{ fontSize: 12, padding: '4px 12px', height: 32 }}
                      >
                        {verifyingProvider === 'gemini' ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {geminiVerifiedStatus && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: geminiVerifiedStatus.success ? 'var(--success)' : 'var(--error)' }}>
                        {geminiVerifiedStatus.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>{geminiVerifiedStatus.message}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <select
                      className="select-input"
                      value={geminiModelSelect}
                      onChange={(e) => setGeminiModelSelect(e.target.value)}
                      style={{ height: 32, fontSize: 13, margin: 0 }}
                    >
                      <option value="gemini-3.1-flash-live-preview">Gemini 3.1 Flash Live Preview (Default)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                      <option value="gemini-2.5-flash-8b">Gemini 2.5 Flash 8B</option>
                      <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                      <option value="custom">Custom Model...</option>
                    </select>
                    {geminiModelSelect === 'custom' && (
                      <input
                        type="text"
                        className="text-input"
                        value={geminiModelCustom}
                        onChange={(e) => setGeminiModelCustom(e.target.value)}
                        placeholder="Custom Model ID (e.g. gemini-3.1-flash)"
                        style={{ height: 32, fontSize: 13, margin: 0 }}
                      />
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSaveModelSettings('gemini')}
                      style={{ fontSize: 12, padding: '6px 12px', height: 32 }}
                    >
                      Save
                    </button>
                    {geminiSaveMsg && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{geminiSaveMsg}</span>}
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, fontSize: 13 }}>OpenAI</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="password"
                        className="text-input"
                        value={settingsOpenaiApiKey}
                        onChange={(e) => {
                          setSettingsOpenaiApiKey(e.target.value);
                          setOpenaiVerifiedStatus(null);
                        }}
                        placeholder={settingsOpenaiApiKey ? '••••••••' : 'Enter OpenAI API Key'}
                        style={{ flex: 1, height: 32, fontSize: 13, margin: 0 }}
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleVerifyKey('openai')}
                        disabled={verifyingProvider === 'openai'}
                        style={{ fontSize: 12, padding: '4px 12px', height: 32 }}
                      >
                        {verifyingProvider === 'openai' ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    {openaiVerifiedStatus && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: openaiVerifiedStatus.success ? 'var(--success)' : 'var(--error)' }}>
                        {openaiVerifiedStatus.success ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        <span>{openaiVerifiedStatus.message}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <select
                      className="select-input"
                      value={openaiModelSelect}
                      onChange={(e) => setOpenaiModelSelect(e.target.value)}
                      style={{ height: 32, fontSize: 13, margin: 0 }}
                    >
                      <option value="gpt-realtime-2">GPT Realtime 2 (Default)</option>
                      <option value="gpt-4o-realtime-preview">GPT-4o Realtime Preview</option>
                      <option value="gpt-4o-mini-realtime-preview">GPT-4o mini Realtime Preview</option>
                      <option value="custom">Custom Model...</option>
                    </select>
                    {openaiModelSelect === 'custom' && (
                      <input
                        type="text"
                        className="text-input"
                        value={openaiModelCustom}
                        onChange={(e) => setOpenaiModelCustom(e.target.value)}
                        placeholder="Custom Model ID (e.g. gpt-realtime-2)"
                        style={{ height: 32, fontSize: 13, margin: 0 }}
                      />
                    )}
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSaveModelSettings('openai')}
                      style={{ fontSize: 12, padding: '6px 12px', height: 32 }}
                    >
                      Save
                    </button>
                    {openaiSaveMsg && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{openaiSaveMsg}</span>}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EvaluationSection({
  evaluationProvider, setEvaluationProvider,
  evaluationModelSelect, setEvaluationModelSelect,
  evaluationModelCustom, setEvaluationModelCustom,
  advancedSaveMsg,
  handleSaveEvaluationSettings,
}) {
  return (
    <div className="card" style={{ margin: 0 }}>
      <div className="card-header">
        <span className="card-title">Evaluation Configuration</span>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong>Evaluation model</strong> is the text-only model used by the LLM-judge reviewer for tool-call correctness and hallucination scoring. It does not affect the live voice agent.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Evaluation Provider</label>
            <select
              className="select-input"
              value={evaluationProvider}
              onChange={(e) => {
                const newProv = e.target.value;
                setEvaluationProvider(newProv);
                if (newProv === 'gemini') {
                  setEvaluationModelSelect('gemini-3.1-flash-lite');
                } else {
                  setEvaluationModelSelect('gpt-4o-mini');
                }
              }}
              style={{ height: 32, fontSize: 13 }}
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Evaluator Model</label>
            <select
              className="select-input"
              value={evaluationModelSelect}
              onChange={(e) => setEvaluationModelSelect(e.target.value)}
              style={{ height: 32, fontSize: 13 }}
            >
              {evaluationProvider === 'gemini' ? (
                <>
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Default)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">GPT-4o mini (Default)</option>
                  <option value="gpt-4o">GPT-4o</option>
                </>
              )}
              <option value="custom">Custom Model...</option>
            </select>
          </div>
        </div>

        {evaluationModelSelect === 'custom' && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Custom Evaluator Model ID</label>
            <input
              type="text"
              className="text-input"
              value={evaluationModelCustom}
              onChange={(e) => setEvaluationModelCustom(e.target.value)}
              placeholder={evaluationProvider === 'gemini' ? 'e.g. gemini-3.5-flash' : 'e.g. o1-mini'}
              style={{ height: 32, fontSize: 13 }}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveEvaluationSettings}
            style={{ fontSize: 13, padding: '6px 16px' }}
          >
            Save Evaluation Config
          </button>
          {advancedSaveMsg && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{advancedSaveMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TtsSection({
  ttsEngine, setTtsEngine,
  openaiTtsModel, setOpenaiTtsModel,
  openaiTtsVoice, setOpenaiTtsVoice,
  googleTtsVoiceSelect, setGoogleTtsVoiceSelect,
  googleTtsVoiceCustom, setGoogleTtsVoiceCustom,
  ttsEngineAvailable,
  advancedSaveMsg,
  handleSaveTtsSettings,
}) {
  return (
    <div className="card" style={{ margin: 0 }}>
      <div className="card-header">
        <span className="card-title">TTS Configuration</span>
      </div>
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          <strong>TTS engine</strong> renders each utterance into audio that the harness then plays into the voice agent. <code>Local OS</code> is selected by default to generate audio on your machine without external API dependencies.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group" style={{ margin: 0, maxWidth: 300 }}>
            <label className="form-label">Engine</label>
            <select
              className="select-input"
              value={ttsEngine}
              onChange={(e) => setTtsEngine(e.target.value)}
              style={{ height: 32, fontSize: 13 }}
            >
              <option value="local">Local OS (default)</option>
              <option value="auto">Auto (fallback chain)</option>
              <option value="openai" disabled={!ttsEngineAvailable.openai}>
                OpenAI{!ttsEngineAvailable.openai ? ' (no key)' : ''}
              </option>
              <option value="google" disabled={!ttsEngineAvailable.google}>
                Google{!ttsEngineAvailable.google ? ' (no key)' : ''}
              </option>
            </select>
          </div>

          {ttsEngine === 'local' && (
            <div style={{ padding: 12, borderRadius: 6, backgroundColor: 'var(--bg-accent)', fontSize: 12, color: 'var(--muted)' }}>
              <strong>Local OS TTS active.</strong> Uses the host machine's native speech synthesis engine (e.g. <code>say</code> on macOS, <code>espeak-ng</code>/<code>espeak</code> on Linux, or PowerShell on Windows). No API keys or extra settings are required.
            </div>
          )}

          {(ttsEngine === 'openai' || ttsEngine === 'auto') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 6, backgroundColor: 'var(--card-bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>OpenAI TTS Settings</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">OpenAI TTS model</label>
                  <select
                    className="select-input"
                    value={openaiTtsModel}
                    onChange={(e) => setOpenaiTtsModel(e.target.value)}
                    style={{ height: 32, fontSize: 13 }}
                  >
                    <option value="tts-1">tts-1 (default)</option>
                    <option value="tts-1-hd">tts-1-hd</option>
                    <option value="gpt-4o-mini-tts">gpt-4o-mini-tts</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">OpenAI TTS voice</label>
                  <select
                    className="select-input"
                    value={openaiTtsVoice}
                    onChange={(e) => setOpenaiTtsVoice(e.target.value)}
                    style={{ height: 32, fontSize: 13 }}
                  >
                    <option value="nova">nova</option>
                    <option value="alloy">alloy</option>
                    <option value="echo">echo</option>
                    <option value="fable">fable</option>
                    <option value="onyx">onyx</option>
                    <option value="shimmer">shimmer</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(ttsEngine === 'google' || ttsEngine === 'auto') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 6, backgroundColor: 'var(--card-bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)' }}>Google TTS Settings</div>
              <div style={{ display: 'grid', gridTemplateColumns: googleTtsVoiceSelect === 'custom' ? '1fr 1fr' : '1fr', gap: 16 }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Google TTS Voice</label>
                  <select
                    className="select-input"
                    value={googleTtsVoiceSelect}
                    onChange={(e) => setGoogleTtsVoiceSelect(e.target.value)}
                    style={{ height: 32, fontSize: 13 }}
                  >
                    <option value="en-US-Journey-F">en-US-Journey-F (Female Journey)</option>
                    <option value="en-US-Journey-D">en-US-Journey-D (Male Journey)</option>
                    <option value="en-US-Wavenet-F">en-US-Wavenet-F (Female Wavenet)</option>
                    <option value="en-US-Wavenet-D">en-US-Wavenet-D (Male Wavenet)</option>
                    <option value="en-US-Neutral-A">en-US-Neutral-A (Neutral)</option>
                    <option value="en-US-News-K">en-US-News-K (News Style)</option>
                    <option value="custom">Custom Voice...</option>
                  </select>
                </div>

                {googleTtsVoiceSelect === 'custom' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Custom Voice ID</label>
                    <input
                      type="text"
                      className="text-input"
                      value={googleTtsVoiceCustom}
                      onChange={(e) => setGoogleTtsVoiceCustom(e.target.value)}
                      placeholder="e.g. en-US-Journey-F"
                      style={{ height: 32, fontSize: 13 }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          <strong>Local OS availability:</strong>{' '}
          macOS uses <code>say</code> (built-in); Linux requires <code>espeak-ng</code> or <code>espeak</code> on PATH; Windows uses PowerShell's <code>System.Speech.Synthesis</code>.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn btn-primary"
            onClick={handleSaveTtsSettings}
            style={{ fontSize: 13, padding: '6px 16px' }}
          >
            Save TTS Config
          </button>
          {advancedSaveMsg && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{advancedSaveMsg}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function UtterancesSection({
  templates, backendConfig,
  settingsUtterances, setSettingsUtterances,
  setRawArgsState,
  handleLoadTemplate,
  backendUrl, setUtterancesSaveMsg,
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
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
          <select
            className="select-input"
            value={backendConfig?.active_template || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val) handleLoadTemplate(val);
            }}
            style={{ fontSize: 13, height: 32, padding: '4px 10px', width: 280, margin: 0 }}
          >
            <option value="" disabled>Switch Template...</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.turns_count} turns)
              </option>
            ))}
            {backendConfig?.active_template === 'custom' && (
              <option value="custom" disabled>Custom / Modified</option>
            )}
          </select>
          <button
            className="btn"
            title="Clone current template"
            onClick={() => {
              const cur = templates.find((t) => t.id === backendConfig?.active_template);
              setNewTemplateName(cur ? `${cur.name} (Copy)` : '');
              setNewTemplateDesc(cur?.description || '');
              setNewTemplateFirstMessage('');
              setNewTemplateMode('clone');
              setNewTemplateSystemPrompt(cur?.system_prompt || '');
              setNewTemplateToolsJson(JSON.stringify(cur?.tools || [], null, 2));
              setIsAddTemplateModalOpen(true);
            }}
            style={{ padding: '4px 10px', fontSize: 13, height: 32, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Copy size={14} />
          </button>
          <button
            className="btn"
            title="Create brand new template"
            onClick={() => {
              setNewTemplateName('');
              setNewTemplateDesc('');
              setNewTemplateFirstMessage('');
              setNewTemplateMode('scratch');
              setNewTemplateSystemPrompt('You are a helpful assistant. Be concise and respond conversationally.');
              setNewTemplateToolsJson('[]');
              setIsAddTemplateModalOpen(true);
            }}
            style={{ padding: '4px 10px', fontSize: 13, height: 32, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={14} /> New Template
          </button>
        </div>
      </div>

      <div className="card" style={{ margin: 0 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{templates.find((t) => t.id === backendConfig?.active_template)?.name || 'Current Evaluation Script'} ({settingsUtterances.length} turns)</span>
            <button
              className="btn-icon"
              onClick={() => {
                const cur = templates.find((t) => t.id === backendConfig?.active_template);
                if (cur) {
                  setEditTemplateName(cur.name);
                  setEditTemplateDesc(cur.description || '');
                  setEditTemplateSystemPrompt(cur.system_prompt || '');
                  setEditTemplateToolsJson(JSON.stringify(cur.tools || [], null, 2));
                  setEditTemplateIsBuiltin(!!cur.is_builtin);
                  setEditTemplateOriginalId(cur.id);
                } else {
                  setEditTemplateName('My Custom Scenario');
                  setEditTemplateDesc('');
                  setEditTemplateSystemPrompt('You are a helpful assistant.');
                  setEditTemplateToolsJson('[]');
                  setEditTemplateIsBuiltin(false);
                  setEditTemplateOriginalId(null);
                }
                setIsEditTemplateModalOpen(true);
              }}
              style={{ padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}
              title="Edit Template (Name, Description, System Prompt, Tools)"
            >
              <Edit2 size={13} style={{ cursor: 'pointer' }} />
            </button>
          </span>
          <button
            className="btn btn-primary"
            onClick={() => {
              const nextIndex = settingsUtterances.length;
              const nextId = `u${String(nextIndex + 1).padStart(2, '0')}`;
              setEditingUtteranceIdx(null);
              setNewUtteranceId(nextId);
              setNewUtteranceText('');
              setNewUtteranceExpectType('none');
              setNewUtterancePhrases('');
              setNewUtteranceTool('');
              setNewUtteranceArgs('');
              setNewUtteranceBehaviorType('sequential');
              setNewUtteranceBargeInDelay(600);
              setNewUtteranceExpectInterrupted(false);
              setIsAddUtteranceModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', fontSize: 13, height: 32 }}
          >
            <Plus size={16} /> Add Utterance
          </button>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {settingsUtterances.length === 0 ? (
            <UtterancesOnboarding
              templates={templates}
              handleLoadTemplate={handleLoadTemplate}
              setSettingsUtterances={setSettingsUtterances}
              setRawArgsState={setRawArgsState}
            />
          ) : (
            <UtterancesList
              settingsUtterances={settingsUtterances}
              setSettingsUtterances={setSettingsUtterances}
              backendUrl={backendUrl}
              setUtterancesSaveMsg={setUtterancesSaveMsg}
              setIsAddUtteranceModalOpen={setIsAddUtteranceModalOpen}
              setEditingUtteranceIdx={setEditingUtteranceIdx}
              setNewUtteranceId={setNewUtteranceId}
              setNewUtteranceText={setNewUtteranceText}
              setNewUtteranceExpectType={setNewUtteranceExpectType}
              setNewUtterancePhrases={setNewUtterancePhrases}
              setNewUtteranceTool={setNewUtteranceTool}
              setNewUtteranceArgs={setNewUtteranceArgs}
              setNewUtteranceBehaviorType={setNewUtteranceBehaviorType}
              setNewUtteranceBargeInDelay={setNewUtteranceBargeInDelay}
              setNewUtteranceExpectInterrupted={setNewUtteranceExpectInterrupted}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function UtterancesOnboarding({ templates, handleLoadTemplate, setSettingsUtterances, setRawArgsState }) {
  return (
    <div className="onboarding-container" style={{
      padding: '30px 20px',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.01)',
      borderRadius: 12,
      border: '1px dashed var(--border)',
      margin: '10px 0',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: 'var(--fg)' }}>
        Get Started with a Benchmarking Template
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 500, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
        Select one of the built-in benchmark usecases to populate your test utterances, or start with a blank list.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24,
        textAlign: 'left',
      }}>
        {templates.map((t) => (
          <div
            key={t.id}
            className="glass-card"
            style={{
              padding: 16,
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onClick={() => handleLoadTemplate(t.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
              e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--fg)' }}>{t.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4, marginBottom: 12 }}>{t.description}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)' }}>{t.turns_count} Turns</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--fg)', display: 'flex', alignItems: 'center', gap: 4 }}>
                Load Usecase <ChevronRight size={12} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
        <button
          className="btn"
          onClick={() => {
            setSettingsUtterances([{ id: 'u01', text: '' }]);
            setRawArgsState({ 0: '' });
          }}
          style={{ fontSize: 12 }}
        >
          Start Blank Usecase
        </button>
      </div>
    </div>
  );
}

function UtterancesList({
  settingsUtterances, setSettingsUtterances,
  backendUrl, setUtterancesSaveMsg,
  setIsAddUtteranceModalOpen, setEditingUtteranceIdx,
  setNewUtteranceId, setNewUtteranceText, setNewUtteranceExpectType,
  setNewUtterancePhrases, setNewUtteranceTool, setNewUtteranceArgs,
  setNewUtteranceBehaviorType, setNewUtteranceBargeInDelay, setNewUtteranceExpectInterrupted,
}) {
  return (
    <div style={{ position: 'relative', paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
      <div style={{
        position: 'absolute',
        left: '11px',
        top: '12px',
        bottom: '12px',
        width: '2px',
        backgroundColor: 'var(--border)',
      }} />

      {settingsUtterances.map((u, idx) => {
        const expectType = u.expect?.tool
          ? 'tool'
          : Array.isArray(u.expect?.response_contains)
            ? 'phrases'
            : u.expect?.response
              ? 'phrases'
              : 'none';

        return (
          <div key={idx} style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '-32px',
              top: '20px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg)',
              border: '2px solid var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              boxShadow: '0 0 8px rgba(99, 102, 241, 0.2)',
            }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {idx + 1}
              </span>
            </div>

            <div className="glass-card" style={{
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              background: 'rgba(255, 255, 255, 0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--muted)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontFamily: 'var(--font-mono)',
                }}>
                  {u.id}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg)', marginBottom: 2 }}>{u.text}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {expectType !== 'none' && (
                      <span style={{ fontSize: 10, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Target size={10} />
                        {expectType === 'tool' ? `Tool: ${u.expect.tool}` : `Contains: ${Array.isArray(u.expect?.response_contains) ? u.expect.response_contains.join(', ') : (u.expect?.response || '')}`}
                      </span>
                    )}
                    {u.behavior?.type === 'barge_in' && (
                      <span style={{ fontSize: 10, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Zap size={10} /> Barge-in ({u.behavior.delay_ms}ms)
                      </span>
                    )}
                    {u.expect?.interrupted && (
                      <span style={{ fontSize: 10, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <XCircle size={10} /> Expect Interrupted
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  className="btn"
                  onClick={() => {
                    setEditingUtteranceIdx(idx);
                    setNewUtteranceId(u.id);
                    setNewUtteranceText(u.text);
                    setNewUtteranceExpectType(expectType);
                    setNewUtterancePhrases(Array.isArray(u.expect?.response_contains) ? u.expect.response_contains.join(', ') : (u.expect?.response || ''));
                    setNewUtteranceTool(u.expect?.tool || '');
                    setNewUtteranceArgs(u.expect?.args ? JSON.stringify(u.expect.args) : '');
                    setNewUtteranceBehaviorType(u.behavior?.type || 'sequential');
                    setNewUtteranceBargeInDelay(u.behavior?.delay_ms ?? 600);
                    setNewUtteranceExpectInterrupted(!!u.expect?.interrupted);
                    setIsAddUtteranceModalOpen(true);
                  }}
                  style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, height: 28 }}
                >
                  <Edit2 size={12} /> Edit
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this utterance?')) {
                      const updated = settingsUtterances.filter((_, i) => i !== idx);
                      fetch(`${backendUrl}/api/utterances/json`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ utterances: updated })
                      })
                        .then((res) => res.json())
                        .then(() => {
                          setSettingsUtterances(updated);
                          setUtterancesSaveMsg('Deleted and saved.');
                          setTimeout(() => setUtterancesSaveMsg(''), 2000);
                        });
                    }
                  }}
                  style={{ padding: '4px 8px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, height: 28, color: 'var(--error)' }}
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
