// Top-of-page demo: 3-clip player with synced confidence bar.
// Uses the existing GIF assets as the visual; predictions drive the telemetry.

const { useState, useEffect, useRef } = React;

function DemoPlayer() {
  const [clipIdx, setClipIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [t, setT] = useState(0); // 0..1 across the clip
  const startRef = useRef(performance.now());
  const offsetRef = useRef(0);
  const clip = window.STR1KE.CLIPS[clipIdx];
  const durationMs = (clip.totalFrames / clip.fps) * 1000;

  useEffect(() => {
    startRef.current = performance.now();
    offsetRef.current = 0;
    setT(0);
  }, [clipIdx]);

  useEffect(() => {
    if (!playing) return;
    let raf;
    const tick = () => {
      const elapsed = (performance.now() - startRef.current + offsetRef.current) % durationMs;
      setT(elapsed / durationMs);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, durationMs, clipIdx]);

  const frameIdx = Math.floor(t * (clip.totalFrames - 1));
  const winIdx = Math.min(clip.predictions.length - 1, Math.floor(frameIdx / clip.windowSize));
  const pred = clip.predictions[winIdx];
  const isStrike = pred.confidence >= 0.5;

  return (
    <div className="dp">
      <div className="dp-tabs">
        {window.STR1KE.CLIPS.map((c, i) => (
          <button key={c.id} onClick={() => setClipIdx(i)} className={i === clipIdx ? 'on' : ''}>
            <span className="num">0{i + 1}</span>
            <span className="nm">{c.name}</span>
          </button>
        ))}
      </div>

      <div className="dp-stage">
        <div className="dp-video">
          <img src={clip.asset} alt={clip.name} />
          <div className="dp-flash" style={{ opacity: isStrike ? 1 : 0 }} />
          <div className="dp-corners">
            <span /><span /><span /><span />
          </div>
          <div className="dp-overlay-top">
            <span className="live">
              <span className="dot" /> live inference
            </span>
            <span className="meta mono">{clip.fps} fps · 5-frame windows</span>
          </div>
          <div className="dp-overlay-bot">
            <span className="mono">f{String(frameIdx).padStart(3, '0')} / {clip.totalFrames - 1}</span>
            <span className="mono">w{String(winIdx).padStart(2, '0')} / {clip.predictions.length - 1}</span>
          </div>
        </div>

        <div className="dp-side">
          <div className="dp-block">
            <div className="lbl">model call</div>
            <div className={`call ${isStrike ? 'strike' : 'neutral'}`}>
              {isStrike ? 'STRIKE' : 'neutral'}
            </div>
          </div>

          <div className="dp-block">
            <div className="lbl">P(strike)</div>
            <div className="conf mono">{pred.confidence.toFixed(3)}</div>
            <div className="conf-bar">
              <div className="fill" style={{ width: `${pred.confidence * 100}%` }} />
              <div className="thresh" />
            </div>
            <div className="conf-axis mono">
              <span>0.0</span><span>0.5</span><span>1.0</span>
            </div>
          </div>

          <div className="dp-block">
            <div className="lbl">clip</div>
            <div className="cliptitle">{clip.name}</div>
            <div className="clipsub">{clip.subtitle}</div>
          </div>

          <div className="dp-block dp-notes">
            <div className="lbl">commentary</div>
            <p>{clip.notes}</p>
          </div>
        </div>
      </div>

      <div className="dp-strip">
        <div className="dp-strip-head mono">
          <span>per-window calls</span>
          <span>{clip.predictions.length} windows · {clip.totalFrames} frames</span>
        </div>
        <div className="dp-bars">
          {clip.predictions.map((p, i) => {
            const cur = i === winIdx;
            const hit = p.confidence >= 0.5;
            return (
              <div
                key={i}
                className={`bar ${hit ? 'hit' : ''} ${cur ? 'cur' : ''}`}
                style={{ height: `${Math.max(4, p.confidence * 100)}%` }}
                title={`w${i} · ${p.confidence.toFixed(3)}`}
                onClick={() => {
                  const target = (i * clip.windowSize) / (clip.totalFrames - 1);
                  offsetRef.current = target * durationMs - (performance.now() - startRef.current);
                  setT(target);
                }}
              />
            );
          })}
          <div className="dp-thresh-line" />
        </div>
      </div>

      <div className="dp-controls mono">
        <button onClick={() => setPlaying(p => !p)} className="dp-play">
          {playing ? '◼ pause' : '▶ play'}
        </button>
        <span className="time">{(frameIdx / clip.fps).toFixed(2)}s / {((clip.totalFrames - 1) / clip.fps).toFixed(2)}s</span>
        <span className="dp-hint">click any bar to jump · cycles automatically</span>
      </div>
    </div>
  );
}

window.STR1KE_DEMO = { DemoPlayer };
