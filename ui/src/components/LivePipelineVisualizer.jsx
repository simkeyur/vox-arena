import { Mic, CloudLightning, AudioLines, ClipboardCheck } from 'lucide-react';

export default function LivePipelineVisualizer({ activeStep }) {
  const steps = [
    { label: 'Audio Injector', icon: Mic, desc: 'AudioInjectionProcessor' },
    { label: 'Provider Adapter', icon: CloudLightning, desc: 'BaseProviderAdapter' },
    { label: 'Audio Capture', icon: AudioLines, desc: 'AudioCaptureProcessor' },
    { label: 'Metrics Collector', icon: ClipboardCheck, desc: 'MetricsCollector' },
  ];

  const progressPercent = activeStep <= 1 ? 0 : ((activeStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="card pipeline-visualizer-card">
      <div className="card-header" style={{ marginBottom: 12 }}>
        <span className="card-title">Live Pipecat Session Telemetry</span>
      </div>
      <div className="card-body">
        <div className="pipeline-visualizer">
          <div className="pipeline-nodes-container">
            <div className="pipeline-connector">
              <div
                className="pipeline-connector-progress"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {steps.map((step, idx) => {
              const stepNum = idx + 1;
              let status = 'idle';
              if (activeStep >= stepNum) {
                status = activeStep === stepNum ? 'active' : 'completed';
              }
              const Icon = step.icon;

              return (
                <div key={idx} className={`pipeline-node ${status}`}>
                  <div className="pipeline-node-icon-wrapper">
                    <Icon size={18} className={status === 'active' ? 'animate-pulse' : ''} />
                  </div>
                  <div className="pipeline-node-label">{step.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: -2 }}>{step.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
