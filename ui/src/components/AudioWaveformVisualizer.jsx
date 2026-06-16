import { useState, useEffect, useRef } from 'react';

export default function AudioWaveformVisualizer({ src, latencyMs }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [audioData, setAudioData] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error('Audio file not available');
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => {
        if (!active) return;
        setDuration(audioBuffer.duration);

        const rawData = audioBuffer.getChannelData(0);
        const samples = 80;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
          let blockStart = blockSize * i;
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]);
          }
          filteredData.push(sum / blockSize);
        }

        const max = Math.max(...filteredData);
        const normalizedData = filteredData.map((n) => (max > 0 ? n / max : 0.05));
        setAudioData(normalizedData);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Waveform load skipped or failed:', err.message);
        if (active) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [src]);

  useEffect(() => {
    if (!audioData || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.clearRect(0, 0, w, h);

    const barWidth = w / audioData.length;
    const gap = 1.5;

    for (let i = 0; i < audioData.length; i++) {
      const val = audioData[i];
      const barHeight = Math.max(3, val * (h - 8));
      const x = i * barWidth;
      const y = (h - barHeight) / 2;

      const barTime = (i / audioData.length) * duration;
      const isLatency = latencyMs && barTime < (latencyMs / 1000);

      if (isLatency) {
        ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
      } else {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      }

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, Math.max(1, barWidth - gap), barHeight, 2);
      } else {
        ctx.rect(x, y, Math.max(1, barWidth - gap), barHeight);
      }
      ctx.fill();
    }
  }, [audioData, duration, latencyMs]);

  const latencyPercent = (latencyMs && duration) ? Math.min(95, ((latencyMs / 1000) / duration) * 100) : 0;

  return (
    <div className="audio-player-wrapper">
      <div className="waveform-canvas-container">
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'var(--muted)' }}>
            Processing audio peaks...
          </div>
        )}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 11, color: 'var(--muted)' }}>
            Waveform rendering unavailable
          </div>
        )}
        {!loading && !error && (
          <>
            <canvas ref={canvasRef} className="waveform-canvas" />
            {latencyPercent > 0 && (
              <div
                className="waveform-latency-marker"
                style={{ width: `${latencyPercent}%` }}
                title={`Time-To-First-Audio Latency: ${Math.round(latencyMs)}ms`}
              >
                <span>{Math.round(latencyMs)}ms TTFA</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
