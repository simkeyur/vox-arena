import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import AudioWaveformVisualizer from './AudioWaveformVisualizer';

function formatTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ src, latencyMs, fullWidth }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  };

  if (fullWidth) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              flexShrink: 0,
            }}
          >
            {playing ? <Pause size={14} fill="#fff" /> : <Play size={14} fill="#fff" />}
          </button>

          {playing && (
            <div className="audio-eq-bars">
              <span /><span /><span /><span /><span />
            </div>
          )}

          <div style={{ flex: 1, cursor: 'pointer' }} onClick={handleSeek}>
            <AudioWaveformVisualizer src={src} latencyMs={latencyMs} currentTime={currentTime} duration={duration} />
          </div>

          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', whiteSpace: 'nowrap', minWidth: 72, textAlign: 'right' }}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={src}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => { setPlaying(false); setCurrentTime(0); }}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          className="audio-play-btn"
          onClick={toggle}
          aria-label={playing ? 'Pause response audio' : 'Play response audio'}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.25)',
            flexShrink: 0,
          }}
        >
          {playing ? <Pause size={12} fill="#fff" /> : <Play size={12} fill="#fff" />}
        </button>

        {playing && (
          <div className="audio-eq-bars audio-eq-bars--sm">
            <span /><span /><span />
          </div>
        )}

        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <AudioWaveformVisualizer src={src} latencyMs={latencyMs} currentTime={currentTime} duration={duration} />

      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCurrentTime(0); }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        style={{ display: 'none' }}
      />
    </div>
  );
}
