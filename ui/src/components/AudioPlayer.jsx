import { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import AudioWaveformVisualizer from './AudioWaveformVisualizer';

export default function AudioPlayer({ src, latencyMs }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
  };

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
        <span className="audio-player-label" style={{ fontWeight: 600, fontSize: 11, color: 'var(--fg)' }}>Play Response</span>
      </div>

      <AudioWaveformVisualizer src={src} latencyMs={latencyMs} />

      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
      />
    </div>
  );
}
