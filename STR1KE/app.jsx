// Main page assembly.

const { useState, useEffect } = React;

const { ConfidenceTimeline, TrainingCurves, SAM2Slider, TSNDiagram } = window.STR1KE_FIGS;
const { DemoPlayer } = window.STR1KE_DEMO;

function Ticker() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getUTCHours()).padStart(2, '0');
      const mm = String(d.getUTCMinutes()).padStart(2, '0');
      const ss = String(d.getUTCSeconds()).padStart(2, '0');
      setT(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="ticker">
      <span><span className="red-dot" />STR1KE</span>
      <span className="sep">·</span>
      <span>tsn · resnet-50 · k400 → mma</span>
      <span className="sep">·</span>
      <span>n=38 · acc 0.83</span>
      <span className="right">
        <span>{t}</span>
        <a href="#demo">demo</a>
        <a href="#pipeline">pipeline</a>
        <a href="#results">results</a>
        <a href="#repro">repro</a>
      </span>
    </div>
  );
}

function App() {
  return (
    <>
      <Ticker />

      {/* MASTHEAD */}
      <div className="shell">
        <header className="mast">
          <div className="eyebrow"><span className="pip" />Technical report · 2026</div>
          <h1>
            Strike detection in MMA broadcast video with a <em>5-frame</em> temporal classifier on top of SAM2 silhouettes.
          </h1>
          <p className="deck">
            A three-stage pipeline — segment, annotate, classify — that calls strike or neutral
            on every 5-frame window. Trained on 38 hand-labeled windows and a Kinetics-400 prior.
            This page presents the system, the design decisions, and the failure modes that
            survive them.
          </p>
          <div className="meta">
            <div><b>Author</b>Thomas Ou</div>
            <div><b>Code</b><a href="https://github.com/Smokeybear10" target="_blank" rel="noopener">github.com/Smokeybear10</a></div>
            <div><b>Source</b>UFC 308 · Topuria vs. Holloway</div>
            <div><b>Read time</b>≈ 7 min</div>
            <div><b>Status</b><span style={{color:'var(--red)'}}>technical preview</span></div>
          </div>
        </header>

        {/* ABSTRACT */}
        <section className="abstract">
          <h2>Abstract</h2>
          <p>
            We fine-tune a Temporal Segment Network (ResNet-50, Kinetics-400 pretrain) for binary
            strike / neutral classification on 5-frame windows of MMA footage. SAM2 segmentation
            removes the broadcast (cage, crowd, overlays) before classification, reducing the
            domain-shift burden on a dataset of only 38 hand-labeled windows. The pipeline reaches
            0.83 validation accuracy after under one minute of training on a free-tier Colab GPU.
            A from-scratch 3D CNN baseline never converges — we report both, and discuss where the
            small-data regime forces transfer learning to do almost all the work.
          </p>
        </section>

        {/* DEMO */}
        <section id="demo" className="demo-section">
          <div className="lead">§ 01 · Live inference</div>
          <h2>The model, running on three held-out clips.</h2>
          <DemoPlayer />
        </section>

        {/* SECTION 1 — Why this is hard */}
        <section id="problem" className="section">
          <div className="section-num">§ 02 · Problem</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">In one line</div>
              <p>A strike lands in roughly 150 ms — five frames at 30 fps. The whole action lives in a window narrower than human reaction time.</p>
              <div className="rail-h">Why public datasets fail</div>
              <p>Action-recognition corpora (Kinetics, AVA) treat punches as a coarse label across seconds of context. We need the millisecond.</p>
              <div className="rail-h">Constraints</div>
              <p>Free-tier GPU. One labeler. One weekend. No premium annotation tools.</p>
            </aside>
            <div className="body">
              <p>Detecting a strike in broadcast MMA video is, on the surface, a 1-class action-recognition problem.
              Three things make it specifically hard.</p>
              <p><strong>Temporal scale.</strong> A jab takes 100–200 ms from initiation to contact. At 30 fps that
              is five frames. Most action-recognition models read seconds of context; here the entire signal
              is shorter than a sneeze. Either the model reads all five frames at once, or it misses the action.</p>
              <p><strong>Domain noise.</strong> Broadcast footage carries cage geometry, crowd parallax, scorebugs,
              corporate overlays, and a camera that pans on contact. A naïve classifier will happily learn
              to predict <em>strike</em> whenever the Monster Energy logo enters frame.</p>
              <p><strong>No data.</strong> There is no public, labeled dataset for MMA strike detection. Every
              sample in this work was created from scratch.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Pipeline */}
        <section id="pipeline" className="section">
          <div className="section-num">§ 03 · Pipeline</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">Three stages</div>
              <p>Each stage emits artifacts the next consumes. SAM2 masks → frame folders → softmax.</p>
              <div className="rail-h">Format</div>
              <p>MMAction2 RawframeDataset. Per-clip JPEG folders. Annotation is one line per window: <code>path n_frames label</code>.</p>
            </aside>
            <div className="body">
              <p>The system is staged so each step is independently inspectable. Mask quality can be
              audited without re-running training; classifier output can be re-aggregated without
              re-running segmentation.</p>
            </div>
          </div>

          <div className="pipeline">
            <div className="pipe-step">
              <div className="num">Stage 01</div>
              <h3>Segment</h3>
              <div className="role">SAM2 · Meta</div>
              <p>Promptable segmentation, prompted once per fighter on frame 0 of a clip. SAM2's streaming memory propagates masks forward through fast occlusion and overlapping bodies — exactly the failure modes that defeat simpler trackers.</p>
              <div className="meta-pairs">
                <span>Input</span><span>RGB frames</span>
                <span>Output</span><span>per-frame binary mask</span>
                <span>Prompt</span><span>1 click / fighter</span>
              </div>
            </div>
            <div className="pipe-step">
              <div className="num">Stage 02</div>
              <h3>Annotate</h3>
              <div className="role">Label Studio · SAM2 backend</div>
              <p>38 five-frame windows hand-verified over one weekend at a kitchen table. Balanced 19 / 19. Without ML-assisted propagation (premium-only), every mask had to be inspected manually — the bottleneck is the eye, not the GPU.</p>
              <div className="meta-pairs">
                <span>Windows</span><span>38 (19 strike · 19 neutral)</span>
                <span>Frames each</span><span>5 @ 30 fps</span>
                <span>Split</span><span>30 / 6 / 2</span>
              </div>
            </div>
            <div className="pipe-step">
              <div className="num">Stage 03</div>
              <h3>Classify</h3>
              <div className="role">TSN · ResNet-50 · K400 pretrain</div>
              <p>Temporal Segment Network. Each of the 5 frames passes through a shared ResNet-50; features are averaged into a single 2048-d vector; a fresh FC head produces the binary softmax. Backbone frozen, head fine-tuned.</p>
              <div className="meta-pairs">
                <span>Pretrain</span><span>tsn_r50_1x1x3_100e_k400</span>
                <span>Epochs</span><span>20</span>
                <span>Train time</span><span>&lt; 1 min · 1 GPU</span>
              </div>
            </div>
          </div>

          {/* SAM2 figure */}
          <div className="figure">
            <div className="figh">
              <span><span className="num">FIG 01</span> · Drag to reveal: SAM2 mask vs. broadcast frame</span>
              <span>stage 01</span>
            </div>
            <SAM2Slider />
            <div className="figcap">
              The classifier never sees this image; it sees only the right side. Removing the broadcast
              before classification sidesteps the bulk of domain-shift, which the dataset is too small
              to absorb directly. Background-removal as preprocessing — not as architecture — is the
              single most consequential design decision in the project.
            </div>
          </div>

          <div className="figure">
            <div className="figh">
              <span><span className="num">FIG 02</span> · TSN forward pass on one 5-frame window</span>
              <span>stage 03</span>
            </div>
            <TSNDiagram />
            <div className="figcap">
              Sparse sampling: TSN was designed for untrimmed video, but its consensus rule —
              average per-frame features before the head — is exactly right for our 5-frame
              window. The model is forced to pick up patterns that hold across the whole strike,
              not single-frame artifacts.
            </div>
          </div>
        </section>

        {/* SECTION 3 — TSN vs 3D CNN */}
        <section id="ablation" className="section">
          <div className="section-num">§ 04 · Why not train from scratch</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">First attempt</div>
              <p>Custom 3D CNN. 4-channel input (RGB + SAM2 mask). Conv3D → MaxPool3D → GAP → FC.</p>
              <div className="rail-h">Result</div>
              <p>Validation accuracy stuck at 37.5 % across all 20 epochs. The model never learned.</p>
              <div className="rail-h">Lesson</div>
              <p>n = 38 cannot teach a randomly-initialized 3D conv anything about human motion.</p>
            </aside>
            <div className="body">
              <p>Before the TSN, we tried the architecturally cleaner option: a small 3D CNN that
              ingests RGB and the SAM2 mask jointly as a 4-channel volume. The hypothesis was that
              explicit mask information, fed end-to-end, would let the network learn fighter-aware
              spatiotemporal features.</p>
              <p>It never converged. With 38 training samples, no pretrain is available for 4-channel
              3D convolutions; the model is initialized from scratch and asked to learn human-motion
              priors from a kitchen-table dataset. Validation accuracy flatlined at the majority
              baseline.</p>
              <p>Switching to TSN trades architectural elegance for a strong prior: ResNet-50 has
              already seen <strong>~300 K Kinetics-400 video clips</strong> covering human action.
              Fine-tuning only adapts the final layer. The backbone does the heavy lifting; the
              head learns the strike/neutral boundary.</p>
            </div>
          </div>

          <div className="figure">
            <div className="figh">
              <span><span className="num">FIG 03</span> · 20-epoch training comparison</span>
              <span>n=38 · Colab T4</span>
            </div>
            <TrainingCurves />
            <div className="figcap">
              <strong>Solid:</strong> TSN with K400 pretrain, head-only fine-tune.
              &nbsp;<strong>Dashed:</strong> 3D CNN trained from scratch on RGB + mask.
              The 3D-CNN curve is honest, not hand-drawn — it is the literal result we observed.
              The takeaway is not that 3D convolutions are wrong for this task; it is that, in
              the small-data regime, transfer learning beats theoretically-better-suited architectures
              that lack a useful prior.
            </div>
          </div>
        </section>

        {/* SECTION 4 — Results */}
        <section id="results" className="section">
          <div className="section-num">§ 05 · Results</div>

          <div className="kv-grid">
            <div className="kv"><div className="k">val accuracy</div><div className="v"><em>0.83</em></div><div className="sub">5/6 windows</div></div>
            <div className="kv"><div className="k">peak confidence</div><div className="v">0.98</div><div className="sub">pressure clip · w13</div></div>
            <div className="kv"><div className="k">3D CNN baseline</div><div className="v">0.375</div><div className="sub">majority-class</div></div>
            <div className="kv"><div className="k">train time</div><div className="v">&lt; 60 s</div><div className="sub">colab T4 · 20 epochs</div></div>
          </div>

          <div className="read">
            <aside className="rail">
              <div className="rail-h">What this shows</div>
              <p>Per-window confidence on the Knockdown clip. Three real strike events sit clearly above the threshold; the rest is appropriately quiet.</p>
              <div className="rail-h">What it can't show</div>
              <p>n = 38 means error bars are essentially the entire range. Read this as a working pipeline, not a benchmark.</p>
            </aside>
            <div className="body">
              <p>The plot below is the model's softmax output, window-by-window, on the Knockdown
              clip. Hover anywhere to read the underlying numbers.</p>
            </div>
          </div>

          <div className="figure">
            <div className="figh">
              <span><span className="num">FIG 04</span> · Per-window P(strike) on Knockdown clip · interactive</span>
              <span>40 windows · 200 frames · 16.7 s</span>
            </div>
            <ConfidenceTimeline clip={window.STR1KE.CLIPS[0]} />
            <div className="figcap">
              Each x-tick is one 5-frame window. Red dots mark above-threshold local maxima; the
              dashed line is the 0.5 decision boundary. The three peaks at <span className="mono">w3</span>,
              <span className="mono"> w20</span> and <span className="mono">w35</span> correspond to the
              left hook, the follow-up ground strike, and the referee's intervention motion respectively
              — the model is detecting all three and quieting in between.
            </div>
          </div>
        </section>

        {/* SECTION 5 — Failures */}
        <section id="failures" className="section">
          <div className="section-num">§ 06 · What the model gets wrong</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">Honest limits</div>
              <p>One source fight. One labeler. No multi-fighter generalization claim is made.</p>
              <div className="rail-h">Recurring patterns</div>
              <p>Clinch breaks, missed jabs, and strikes that straddle non-overlapping windows.</p>
            </aside>
            <div className="body">
              <p>Three failure modes recur across the test clips. They are not bugs; they are the
              load-bearing limits of a 38-sample classifier with no temporal context between windows.</p>
            </div>
          </div>

          <div className="fails">
            {window.STR1KE.FAILURES.map(f => (
              <div className="fail-box" key={f.title}>
                <div className="where">{f.where}</div>
                <h4>{f.title}</h4>
                <span className="conf-pill">P(strike) = {f.conf}</span>
                <p>{f.why}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 — What would change with more data */}
        <section id="future" className="section">
          <div className="section-num">§ 07 · What ten times the data would change</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">Bottleneck</div>
              <p>Labeled windows. Everything else is configured.</p>
              <div className="rail-h">Order of operations</div>
              <p>1 · more annotation. 2 · multi-class. 3 · sliding windows. 4 · multi-fight.</p>
            </aside>
            <div className="body">
              <p>The 0.83 number is a ceiling against the 38-window dataset, not against the task.
              The path from here is unglamorous: <strong>more annotation</strong>. Even
              200–500 windows would be transformative. With ML-assisted propagation the
              same weekend yields ~10× the data.</p>
              <p>Beyond volume, three structural changes are queued. <strong>Multi-class labels</strong>
              (jab, cross, hook, kick, elbow, knee, takedown) make the output useful for fight
              analytics, not just highlight detection. <strong>Overlapping sliding windows</strong>
              recover strikes that currently fragment across the boundary at <span className="mono">w14/w15</span>.
              <strong> Multi-fight, multi-fighter</strong> training breaks the implicit overfit to
              Topuria's stance and Holloway's volume.</p>
            </div>
          </div>
        </section>

        {/* SECTION 7 — Reproducibility */}
        <section id="repro" className="section">
          <div className="section-num">§ 08 · Reproducibility</div>
          <div className="read">
            <aside className="rail">
              <div className="rail-h">Stack</div>
              <p>MMAction2 · PyTorch · SAM2 · Label Studio</p>
              <div className="rail-h">Hardware</div>
              <p>Single Colab T4 (free tier)</p>
              <div className="rail-h">Determinism</div>
              <p>Seed 42 · cudnn benchmark off</p>
            </aside>
            <div className="body">
              <p>The annotation format is intentionally simple. Each line in
              <span className="mono"> train.txt </span> is a folder, a frame count, and an integer
              class label — readable by MMAction2's RawframeDataset out of the box.</p>
            </div>
          </div>

          <div className="code-block">
<span className="c"># annotations/train.txt — MMAction2 RawframeDataset format</span>
<span className="c"># &lt;folder&gt; &lt;n_frames&gt; &lt;class_label&gt;   (0 = neutral, 1 = strike)</span>

strike/0  5 1
strike/1  5 1
neutral/0 5 0
neutral/1 5 0
<span className="c">...</span>

<span className="c"># inference (per clip)</span>
<span className="k">from</span> mmaction.apis <span className="k">import</span> inference_recognizer, init_recognizer

model  = init_recognizer(<span className="s">'configs/tsn_r50_strike.py'</span>, <span className="s">'work_dirs/best.pth'</span>)
result = inference_recognizer(model, <span className="s">'window_w20.mp4'</span>)
<span className="c"># result.pred_score → tensor([0.04, 0.96])  →  STRIKE @ 0.96</span>
          </div>

          <table className="tbl">
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>backbone</td><td>ResNet-50</td>
                <td className="serif dim">ImageNet → Kinetics-400 → frozen during fine-tune</td>
              </tr>
              <tr>
                <td>checkpoint</td><td>tsn_r50_1x1x3_100e_kinetics400_rgb</td>
                <td className="serif dim">OpenMMLab model zoo</td>
              </tr>
              <tr>
                <td>input</td><td>5 × 224 × 224 RGB</td>
                <td className="serif dim">center crop · ImageNet norm</td>
              </tr>
              <tr>
                <td>head</td><td>FC 2048 → 2 · softmax</td>
                <td className="serif dim">only learnable parameters</td>
              </tr>
              <tr>
                <td>optimizer</td><td>SGD · lr 0.001 · momentum 0.9</td>
                <td className="serif dim">linear warmup · cosine decay</td>
              </tr>
              <tr>
                <td>epochs</td><td>20</td>
                <td className="serif dim">val acc converged by epoch 9</td>
              </tr>
              <tr>
                <td>data format</td><td>RawframeDataset</td>
                <td className="serif dim">JPEG sequences, not video files</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* FOOTER */}
        <footer className="foot">
          <div className="row">
            <span>STR1KE · technical preview · MMXXVI</span>
            <span className="built">Built by <a href="https://thomasou.com/" target="_blank" rel="noopener">Thomas Ou</a></span>
            <span>
              <a href="https://github.com/Smokeybear10" target="_blank" rel="noopener">github</a>
              &nbsp;·&nbsp;
              <a href="https://www.linkedin.com/in/thomasou0/" target="_blank" rel="noopener">linkedin</a>
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
