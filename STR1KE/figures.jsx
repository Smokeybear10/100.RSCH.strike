// Bespoke interactive figures.

const { useState, useEffect, useRef, useMemo } = React;

// ---------------------------------------------------------------
// Figure: Confidence timeline with hover-scrub frame thumbnails
// ---------------------------------------------------------------
function ConfidenceTimeline({ clip }) {
  const [hover, setHover] = useState(null); // window index
  const svgRef = useRef(null);
  const W = 1000, H = 280, PAD_L = 48, PAD_R = 16, PAD_T = 24, PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const points = clip.predictions.map((p, i) => {
    const x = PAD_L + (i / (clip.predictions.length - 1)) * innerW;
    const y = PAD_T + (1 - p.confidence) * innerH;
    return { x, y, p, i };
  });

  const pathD = points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
  const fillD = `${pathD} L ${points[points.length - 1].x} ${PAD_T + innerH} L ${PAD_L} ${PAD_T + innerH} Z`;

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px < PAD_L || px > W - PAD_R) { setHover(null); return; }
    const idx = Math.round(((px - PAD_L) / innerW) * (clip.predictions.length - 1));
    setHover(Math.max(0, Math.min(clip.predictions.length - 1, idx)));
  };

  const peaks = clip.predictions
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => {
      if (p.confidence < 0.5) return false;
      const prev = clip.predictions[i - 1]?.confidence ?? 0;
      const next = clip.predictions[i + 1]?.confidence ?? 0;
      return p.confidence >= prev && p.confidence >= next;
    });

  const hoverPt = hover != null ? points[hover] : null;
  const thresholdY = PAD_T + 0.5 * innerH;

  return (
    <div className="ct-fig">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="ct-svg"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* y grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(v => (
          <g key={v}>
            <line x1={PAD_L} x2={W - PAD_R} y1={PAD_T + (1 - v) * innerH} y2={PAD_T + (1 - v) * innerH}
              stroke={v === 0.5 ? '#dc2626' : '#2a2a2a'} strokeWidth={v === 0.5 ? 1 : 0.5} strokeDasharray={v === 0.5 ? '4 4' : '0'} />
            <text x={PAD_L - 8} y={PAD_T + (1 - v) * innerH + 4} textAnchor="end"
              fontSize={11} fontFamily="ui-monospace, monospace" fill={v === 0.5 ? '#dc2626' : '#666'}>
              {v.toFixed(2)}
            </text>
          </g>
        ))}
        {/* x ticks */}
        {[0, 10, 20, 30, 39].map(i => {
          const x = PAD_L + (i / (clip.predictions.length - 1)) * innerW;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={PAD_T + innerH} y2={PAD_T + innerH + 4} stroke="#444" />
              <text x={x} y={PAD_T + innerH + 18} textAnchor="middle" fontSize={11}
                fontFamily="ui-monospace, monospace" fill="#888">w{i}</text>
            </g>
          );
        })}

        {/* fill + line */}
        <defs>
          <linearGradient id="ct-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillD} fill="url(#ct-fill)" />
        <path d={pathD} fill="none" stroke="#dc2626" strokeWidth={1.6} />

        {/* peak markers */}
        {peaks.map(({ p, i }) => {
          const pt = points[i];
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={3.5} fill="#dc2626" />
              <circle cx={pt.x} cy={pt.y} r={6} fill="none" stroke="#dc2626" strokeOpacity={0.4} />
              <text x={pt.x} y={pt.y - 12} textAnchor="middle" fontSize={11}
                fontFamily="ui-monospace, monospace" fill="#dc2626" fontWeight={600}>
                {p.confidence.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* hover marker */}
        {hoverPt && (
          <g>
            <line x1={hoverPt.x} x2={hoverPt.x} y1={PAD_T} y2={PAD_T + innerH}
              stroke="#e8e6e1" strokeWidth={0.5} strokeDasharray="2 3" />
            <circle cx={hoverPt.x} cy={hoverPt.y} r={5} fill="#e8e6e1" stroke="#0a0a0a" strokeWidth={2} />
          </g>
        )}

        {/* axis labels */}
        <text x={PAD_L + innerW / 2} y={H - 4} textAnchor="middle"
          fontSize={11} fontFamily="ui-monospace, monospace" fill="#888"
          letterSpacing="0.15em">
          WINDOW INDEX (5 frames each, 167ms)
        </text>
        <text x={12} y={PAD_T + innerH / 2} textAnchor="middle"
          fontSize={11} fontFamily="ui-monospace, monospace" fill="#888"
          letterSpacing="0.15em" transform={`rotate(-90 12 ${PAD_T + innerH / 2})`}>
          P(STRIKE)
        </text>
      </svg>

      {/* hover read-out */}
      <div className="ct-readout">
        {hoverPt ? (
          <>
            <div><span className="lbl">window</span><span className="val mono">w{hoverPt.p.window}</span></div>
            <div><span className="lbl">frames</span><span className="val mono">f{hoverPt.p.startFrame}–f{hoverPt.p.endFrame}</span></div>
            <div><span className="lbl">time</span><span className="val mono">{(hoverPt.p.startFrame / clip.fps).toFixed(2)}s</span></div>
            <div><span className="lbl">p(strike)</span><span className="val mono" style={{color: hoverPt.p.confidence >= 0.5 ? '#dc2626' : '#888'}}>
              {hoverPt.p.confidence.toFixed(3)}
            </span></div>
            <div><span className="lbl">call</span><span className="val mono" style={{color: hoverPt.p.confidence >= 0.5 ? '#dc2626' : '#e8e6e1'}}>
              {hoverPt.p.label.toUpperCase()}
            </span></div>
          </>
        ) : (
          <div className="ct-hint">hover to scrub</div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Figure: TSN vs 3D-CNN training curves (toggle)
// ---------------------------------------------------------------
function TrainingCurves() {
  const [metric, setMetric] = useState('val_acc'); // val_acc | train_loss
  const W = 720, H = 280, PAD_L = 56, PAD_R = 16, PAD_T = 16, PAD_B = 40;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const T = window.STR1KE.TRAINING;
  const epochs = T.epochs;

  const yMin = metric === 'val_acc' ? 0 : 0;
  const yMax = metric === 'val_acc' ? 1 : 0.8;

  const seriesPath = (vals) => vals.map((v, i) => {
    const x = PAD_L + (i / (epochs.length - 1)) * innerW;
    const y = PAD_T + (1 - (v - yMin) / (yMax - yMin)) * innerH;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const tsnVals = T.tsn[metric];
  const cnnVals = T.cnn3d[metric];
  const finalTSN = tsnVals[tsnVals.length - 1];
  const finalCNN = cnnVals[cnnVals.length - 1];

  return (
    <div className="tc-fig">
      <div className="tc-controls">
        <button className={metric === 'val_acc' ? 'on' : ''} onClick={() => setMetric('val_acc')}>
          validation accuracy
        </button>
        <button className={metric === 'train_loss' ? 'on' : ''} onClick={() => setMetric('train_loss')}>
          training loss
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="tc-svg">
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const v = yMin + t * (yMax - yMin);
          const y = PAD_T + (1 - t) * innerH;
          return (
            <g key={t}>
              <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#2a2a2a" strokeWidth={0.5} />
              <text x={PAD_L - 8} y={y + 4} textAnchor="end" fontSize={11}
                fontFamily="ui-monospace, monospace" fill="#666">
                {metric === 'val_acc' ? v.toFixed(2) : v.toFixed(2)}
              </text>
            </g>
          );
        })}
        {[1, 5, 10, 15, 20].map(e => {
          const x = PAD_L + ((e - 1) / (epochs.length - 1)) * innerW;
          return (
            <g key={e}>
              <line x1={x} x2={x} y1={PAD_T + innerH} y2={PAD_T + innerH + 4} stroke="#444" />
              <text x={x} y={PAD_T + innerH + 18} textAnchor="middle" fontSize={11}
                fontFamily="ui-monospace, monospace" fill="#888">{e}</text>
            </g>
          );
        })}

        {/* 3D CNN */}
        <path d={seriesPath(cnnVals)} fill="none" stroke="#666" strokeWidth={1.4} strokeDasharray="4 3" />
        {/* TSN */}
        <path d={seriesPath(tsnVals)} fill="none" stroke="#dc2626" strokeWidth={2} />

        {/* end labels */}
        <text x={W - PAD_R - 4} y={PAD_T + (1 - (finalTSN - yMin) / (yMax - yMin)) * innerH - 6}
          fontSize={11} textAnchor="end" fontFamily="ui-monospace, monospace" fill="#dc2626" fontWeight={600}>
          TSN → {finalTSN.toFixed(metric === 'val_acc' ? 2 : 3)}
        </text>
        <text x={W - PAD_R - 4} y={PAD_T + (1 - (finalCNN - yMin) / (yMax - yMin)) * innerH + 14}
          fontSize={11} textAnchor="end" fontFamily="ui-monospace, monospace" fill="#888">
          3D CNN → {finalCNN.toFixed(metric === 'val_acc' ? 3 : 3)}
        </text>

        <text x={PAD_L + innerW / 2} y={H - 6} textAnchor="middle"
          fontSize={11} fontFamily="ui-monospace, monospace" fill="#888" letterSpacing="0.15em">
          EPOCH
        </text>
        <text x={14} y={PAD_T + innerH / 2} textAnchor="middle"
          fontSize={11} fontFamily="ui-monospace, monospace" fill="#888" letterSpacing="0.15em"
          transform={`rotate(-90 14 ${PAD_T + innerH / 2})`}>
          {metric === 'val_acc' ? 'VAL ACC' : 'TRAIN LOSS'}
        </text>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------
// Figure: SAM2 before/after slider
// ---------------------------------------------------------------
function SAM2Slider() {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);

  return (
    <div className="sam-fig">
      <div
        className="sam-frame"
        ref={ref}
        onMouseMove={(e) => {
          if (e.buttons === 0) return;
          const rect = ref.current.getBoundingClientRect();
          setPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
        }}
        onMouseDown={(e) => {
          const rect = ref.current.getBoundingClientRect();
          setPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
        }}
      >
        {/* "broadcast" — the back layer (rendered as a stylized noisy frame) */}
        <div className="sam-back">
          <div className="sam-broadcast">
            {/* noise stripes for "broadcast chrome" */}
            <div className="sam-cage" />
            <div className="sam-overlays">
              <div className="sam-ovl">R2 · 3:42</div>
              <div className="sam-ovl right">UFC 308</div>
            </div>
            {/* fighter silhouettes (suggestive) */}
            <svg viewBox="0 0 400 240" className="sam-fighters" preserveAspectRatio="xMidYMid slice">
              <g fill="#1a1a1a">
                <ellipse cx="155" cy="120" rx="32" ry="60" />
                <circle cx="155" cy="68" r="18" />
                <rect x="138" y="180" width="12" height="40" />
                <rect x="160" y="180" width="12" height="40" />
                <rect x="118" y="105" width="36" height="14" transform="rotate(-15 155 120)" />
                <ellipse cx="245" cy="120" rx="32" ry="60" />
                <circle cx="245" cy="68" r="18" />
                <rect x="228" y="180" width="12" height="40" />
                <rect x="250" y="180" width="12" height="40" />
                <rect x="246" y="105" width="36" height="14" transform="rotate(15 245 120)" />
              </g>
            </svg>
          </div>
        </div>
        {/* "masked" — the front layer, clipped */}
        <div className="sam-front" style={{ clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)` }}>
          <div className="sam-masked">
            <svg viewBox="0 0 400 240" className="sam-fighters" preserveAspectRatio="xMidYMid slice">
              <g fill="#e8e6e1">
                <ellipse cx="155" cy="120" rx="32" ry="60" />
                <circle cx="155" cy="68" r="18" />
                <rect x="138" y="180" width="12" height="40" />
                <rect x="160" y="180" width="12" height="40" />
                <rect x="118" y="105" width="36" height="14" transform="rotate(-15 155 120)" />
                <ellipse cx="245" cy="120" rx="32" ry="60" />
                <circle cx="245" cy="68" r="18" />
                <rect x="228" y="180" width="12" height="40" />
                <rect x="250" y="180" width="12" height="40" />
                <rect x="246" y="105" width="36" height="14" transform="rotate(15 245 120)" />
              </g>
            </svg>
          </div>
        </div>
        {/* labels */}
        <div className="sam-label left" style={{opacity: pos > 18 ? 1 : 0.3}}>BROADCAST</div>
        <div className="sam-label right" style={{opacity: pos < 82 ? 1 : 0.3}}>SAM2 MASK</div>
        {/* handle */}
        <div className="sam-handle" style={{ left: `${pos}%` }}>
          <div className="sam-handle-bar" />
          <div className="sam-handle-knob">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3 L1 7 L3 11 M11 3 L13 7 L11 11" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
      <div className="sam-track">
        <input type="range" min="0" max="100" value={pos}
          onChange={(e) => setPos(Number(e.target.value))} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Figure: TSN architecture diagram
// ---------------------------------------------------------------
function TSNDiagram() {
  return (
    <svg viewBox="0 0 920 220" className="tsn-svg">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" fill="#888" />
        </marker>
      </defs>
      {/* 5 frame thumbs */}
      {[0,1,2,3,4].map(i => (
        <g key={i}>
          <rect x={20 + i*46} y={50} width={42} height={56} fill="#141414" stroke="#333" />
          <text x={20 + i*46 + 21} y={82} textAnchor="middle" fontSize={11}
            fontFamily="ui-monospace, monospace" fill="#666">f{i+1}</text>
        </g>
      ))}
      <text x={134} y={36} textAnchor="middle" fontSize={11} letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace" fill="#888">5× RGB FRAMES</text>
      <text x={134} y={126} textAnchor="middle" fontSize={11}
        fontFamily="ui-monospace, monospace" fill="#666">224×224 · ImageNet norm</text>

      {/* arrows to backbone */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1={62 + i*46} x2={310} y1={78} y2={78 + (i-2)*8}
          stroke="#888" strokeWidth={0.6} markerEnd="url(#arr)" />
      ))}

      {/* shared backbone */}
      <rect x={310} y={42} width={170} height={72} fill="#0a0a0a" stroke="#dc2626" strokeWidth={1.5} />
      <text x={395} y={68} textAnchor="middle" fontSize={13} fontWeight={600}
        fontFamily="ui-monospace, monospace" fill="#e8e6e1">ResNet-50</text>
      <text x={395} y={86} textAnchor="middle" fontSize={11}
        fontFamily="ui-monospace, monospace" fill="#888">shared backbone</text>
      <text x={395} y={104} textAnchor="middle" fontSize={10}
        fontFamily="ui-monospace, monospace" fill="#666">Kinetics-400 pretrain</text>
      <text x={395} y={32} textAnchor="middle" fontSize={11} letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace" fill="#dc2626">PER-FRAME FEATURES</text>

      {/* arrow to consensus */}
      <line x1={480} y1={78} x2={540} y2={78} stroke="#888" strokeWidth={0.8} markerEnd="url(#arr)" />
      <text x={510} y={70} textAnchor="middle" fontSize={10}
        fontFamily="ui-monospace, monospace" fill="#666">5×2048</text>

      {/* consensus */}
      <rect x={540} y={50} width={130} height={56} fill="#141414" stroke="#444" />
      <text x={605} y={75} textAnchor="middle" fontSize={12}
        fontFamily="ui-monospace, monospace" fill="#e8e6e1">avg pool</text>
      <text x={605} y={92} textAnchor="middle" fontSize={10}
        fontFamily="ui-monospace, monospace" fill="#888">temporal consensus</text>
      <text x={605} y={32} textAnchor="middle" fontSize={11} letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace" fill="#888">AGGREGATE</text>

      {/* arrow to head */}
      <line x1={670} y1={78} x2={730} y2={78} stroke="#888" strokeWidth={0.8} markerEnd="url(#arr)" />
      <text x={700} y={70} textAnchor="middle" fontSize={10}
        fontFamily="ui-monospace, monospace" fill="#666">2048</text>

      {/* head */}
      <rect x={730} y={50} width={170} height={56} fill="#141414" stroke="#dc2626" />
      <text x={815} y={75} textAnchor="middle" fontSize={12}
        fontFamily="ui-monospace, monospace" fill="#e8e6e1">FC → softmax</text>
      <text x={815} y={92} textAnchor="middle" fontSize={10}
        fontFamily="ui-monospace, monospace" fill="#888">2 classes</text>
      <text x={815} y={32} textAnchor="middle" fontSize={11} letterSpacing="0.15em"
        fontFamily="ui-monospace, monospace" fill="#dc2626">CLASSIFY</text>

      {/* output */}
      <text x={815} y={140} textAnchor="middle" fontSize={11}
        fontFamily="ui-monospace, monospace" fill="#888">P(strike), P(neutral)</text>
      <text x={815} y={158} textAnchor="middle" fontSize={13} fontWeight={600}
        fontFamily="ui-monospace, monospace" fill="#dc2626">e.g. 0.847 / 0.153</text>

      {/* trainable indicator */}
      <text x={460} y={200} textAnchor="middle" fontSize={10} letterSpacing="0.1em"
        fontFamily="ui-monospace, monospace" fill="#666">
        — frozen backbone · fine-tuned classifier head only —
      </text>
    </svg>
  );
}

window.STR1KE_FIGS = { ConfidenceTimeline, TrainingCurves, SAM2Slider, TSNDiagram };
