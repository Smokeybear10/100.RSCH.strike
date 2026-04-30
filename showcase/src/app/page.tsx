import { ScrollHero } from "@/components/scroll-hero";
import {
  Ticker, Masthead, Abstract, Section, Figure, PipelineSteps,
  KvGrid, FailGrid, SpecTable, CodeBlock, Upload,
} from "@/components/paper";
import {
  TSNDiagram, SAM2Slider, TrainingCurves, ConfidenceTimelineFigure,
} from "@/components/figures";
import { researchClips, FAILURES, TRAINING } from "@/lib/research-data";
import { RecordedDemoPlayer } from "@/components/paper/recorded-demo-player";

export default function Home() {
  const exampleClip = researchClips[0];
  const finalEpoch = TRAINING.epochs[TRAINING.epochs.length - 1];

  return (
    <main id="main" className="relative bg-paper text-ink">
      <Ticker active="/#abstract" />
      <ScrollHero />
      <div className="mx-auto max-w-[1180px] px-8">
        <Masthead
          title={<>Detecting <em>strike attempts</em> in MMA broadcast footage.</>}
          deck={<>A small-data computer vision study. The current work centers on label quality,
            fight-separated evaluation, and reproducible baselines. Notebook results,
            recorded checkpoint predictions, and illustrative figures are identified separately below.</>}
          meta={[
            { label: "Author", value: "Thomas Ou" },
            { label: "Code", value: <a href="https://github.com/Smokeybear10/100.RSCH.strike"
              target="_blank" rel="noopener noreferrer"
              className="border-b border-rule hover:border-red-600 hover:text-red-600">100.RSCH.strike</a> },
            { label: "Data", value: "38 legacy windows · provenance incomplete" },
            { label: "Status", value: <span className="text-red-600">development baseline</span> },
          ]}
        />
        <Abstract>
          <p>
            Strike classifies five-frame windows as a strike attempt or no attempt.
            Misses and blocked strikes count as attempts. The legacy dataset contains
            38 labeled windows, but both clips designated as test data also appear in
            validation. Those splits cannot support an independent test score.
            The saved TSN run ends at {(finalEpoch.val_accuracy * 100).toFixed(0)}%
            validation accuracy; its earlier 100% results were measured on just six
            validation clips. Neither establishes generalization to unseen fights.
          </p>
        </Abstract>

        <Section id="problem" number="§ 01 · Define the target"
          rail={[
            { heading: "Positive", body: "A committed strike attempt, including a miss or a blocked strike." },
            { heading: "Negative", body: "No strike attempt: movement, guard adjustments, feints, or clinching alone." },
            { heading: "Uncertain", body: "Review occluded or ambiguous windows; do not silently assign them to neutral." },
          ]}>
          <p>
            Contact detection and attempt detection are different tasks. A punch
            that misses still belongs in the positive class. Landed, blocked, and
            missed can be recorded as separate outcome attributes without changing
            the attempt label.
          </p>
          <p>
            Five frames at 30 fps span about 167 ms of playback. That is a sampling
            choice, not a guarantee that a full action fits inside each window.
            Attempt timestamps and source footage identifiers are needed to inspect
            boundaries and avoid counting the same event twice.
          </p>
          <p>
            The old labels have not been re-reviewed against this definition.
            They remain development examples until their provenance and labels are checked.
          </p>
        </Section>

        <Section id="ablation" number="§ 02 · What the existing data supports"
          rail={[
            { heading: "Inventory", body: "38 unique folders, five JPEGs each. 19 legacy strike labels and 19 neutral labels." },
            { heading: "Split issue", body: "30 train entries, six validation entries, and two test entries. Both test clips are also in validation; two other clips are unused." },
            { heading: "Source issue", body: "Fight identifiers and timestamps are missing. A sampled frame identifies Gaethje–Holloway, contradicting the previous blanket source attribution." },
          ]}
          extras={<Figure number="FIG 01" title="Recorded legacy TSN run" scale="20 epochs · six validation clips"
            caption={<>Values are extracted directly from saved notebook output. The former reconstructed
              curves have been removed. Training accuracy reaches 100% while validation ends at 50%.
              The historical 3D CNN notebook is not presented as a controlled comparison.</>}>
            <TrainingCurves />
          </Figure>}>
          <p>
            The first priority is a trustworthy dataset. Reusing a validation clip
            as a test clip measures the same examples again; it does not create a holdout.
            Randomly redistributing adjacent windows can also leak fight-specific appearance.
          </p>
          <p>
            New experiments reserve entire fights for train, validation, or test.
            Legacy examples are kept as development data rather than relabeled as a
            new independent benchmark. The frame folders supplied with the old
            annotations are raw broadcast images; a paired masked evaluation has not been recorded.
          </p>
        </Section>

        <Section id="pipeline" number="§ 03 · Reproducible baseline"
          rail={[
            { heading: "Unit of data", body: "A versioned clip manifest with source, fight, time interval, label, split, and exact frame paths." },
            { heading: "Unit of evaluation", body: "Unseen fights. Report clip-level results first; event-level detection needs attempt boundaries." },
          ]}
          extras={<>
            <PipelineSteps steps={[
              { number: "Stage 01", title: "Audit", role: "Manifest + frame checksums",
                description: "Validate files, labels, provenance, split membership, and duplicated frames before training. Missing provenance blocks research evaluation.",
                meta: [{ label: "Target", value: "strike attempt" }, { label: "Split", value: "by fight" }] },
              { number: "Stage 02", title: "Fit", role: "Frozen ImageNet appearance baseline",
                description: "Extract ResNet-50 features from five frames, average them, and fit a binary linear head. This is a new baseline, separate from the historical MMAction2 notebook.",
                meta: [{ label: "Input", value: "5 RGB frames" }, { label: "Weights", value: "ImageNet1K V1" }] },
              { number: "Stage 03", title: "Evaluate", role: "Saved predictions + run artifacts",
                description: "Select the checkpoint on validation, then evaluate the reserved test fights separately. Keep per-clip probabilities, confusion counts, metrics, configuration, and dataset fingerprint.",
                meta: [{ label: "Outputs", value: "JSON + CSV + checkpoint" }, { label: "Masking", value: "paired experiment" }] },
            ]} />
            <Figure number="FIG 02" title="Masking as an experiment" scale="visual example"
              caption={<>The before/after view illustrates segmentation. It is not evidence that masking improves
                recognition. That requires raw and masked runs on the same clips and fight-separated splits.</>}>
              <SAM2Slider />
            </Figure>
            <Figure number="FIG 03" title="Average five frame representations" scale="appearance baseline"
              caption={<>Averaging makes the representation invariant to frame order. It can recognize visual
                configurations, but it does not explicitly model the direction or timing of a strike.</>}>
              <TSNDiagram />
            </Figure>
          </>}>
          <p>
            A simple baseline makes data improvements measurable. Masking is an
            optional paired input variant, not an assumed performance gain. Both
            variants must use the same clip identities, labels, splits, preprocessing,
            and training settings before their results can be compared.
          </p>
        </Section>

        <Section id="results" number="§ 04 · Results and evidence"
          rail={[
            { heading: "Measured", body: "The historical training chart is parsed from saved notebook logs, with a source checksum." },
            { heading: "Not yet measured", body: "Independent test performance, generalization across fights, event-level recall, and the benefit of masking." },
          ]}
          extras={<>
            <KvGrid items={[
              { k: "legacy windows", v: "38", sub: "190 frames · labels need review" },
              { k: "last-epoch validation", v: `${(finalEpoch.val_accuracy * 100).toFixed(0)}%`, sub: "historical six-clip validation", emphasize: true },
              { k: "test clips in validation", v: "2 / 2", sub: "legacy split overlap" },
              { k: "independent test score", v: "—", sub: "not available" },
            ]} />
            <Figure number="FIG 04" title="Illustrative score timeline" scale="hand-authored interface data"
              caption={<>These scores are fixtures used to demonstrate the player and score display.
                Peaks are not measured detections, calibrated probabilities, or verified strike annotations.</>}>
              <ConfidenceTimelineFigure clip={exampleClip} />
            </Figure>
          </>}>
          <p>
            This page does not report an independent benchmark. The training
            chart documents what the old run recorded. The interactive player below
            uses saved checkpoint predictions on the exact displayed frames. Those
            clips have no verified annotations, so their scores do not establish accuracy.
          </p>
        </Section>

        <Section id="failures" number="§ 05 · Evaluation slices to collect"
          rail={[
            { heading: "Labeling priority", body: "Collect hard negatives and unsuccessful attempts, not just obvious landed punches." },
            { heading: "Report separately", body: "Break down errors by fight, camera view, occlusion, and attempt outcome when those annotations are available." },
          ]}
          extras={<FailGrid items={FAILURES} />}>
          <p>
            These are cases to measure in future evaluation, not claimed failures
            from a held-out run. Keeping them separate makes it possible to tell
            whether the classifier recognizes an attempt or relies on contact and camera cues.
          </p>
        </Section>

        <Section id="future" number="§ 06 · Next data collection"
          rail={[
            { heading: "First", body: "Review the legacy labels and record source fight and time boundaries." },
            { heading: "Then", body: "Add independent fights and freeze the test partition before model selection." },
          ]}>
          <p>
            More adjacent windows from one sequence are not a substitute for
            independent fights. Sample different fighters, camera angles, outcomes,
            and non-strike movement. Keep uncertain labels visible rather than
            hiding them in the negative class.
          </p>
          <p>
            Compare the raw and masked baseline only after both have identical
            reviewed clips and splits. Keep the test fights untouched while choosing
            model settings and thresholds on training and validation data.
          </p>
        </Section>

        <Section id="repro" number="§ 07 · Reproduce the evidence"
          rail={[
            { heading: "Historical record", body: "The notebooks retain their original outputs. The showcase chart is exported from those outputs." },
            { heading: "New experiments", body: "Each run records its seed, preprocessing, weight source, dataset fingerprint, and selected checkpoint." },
          ]}
          extras={<>
            <CodeBlock>{"# Regenerate the chart from saved notebook logs\npython3 model/export_notebook_history.py\n\n# Inspect the research commands\npython -m model.data --help\npython -m model.train --help\npython -m model.evaluate --help"}</CodeBlock>
            <SpecTable rows={[
              { setting: "new baseline", value: "ResNet-50 + average + linear head", notes: "appearance features; frame-order invariant" },
              { setting: "initialization", value: "ImageNet1K V1", notes: "explicit torchvision weight version" },
              { setting: "input", value: "5 × 224 × 224 RGB", notes: "resize 256, center crop, ImageNet normalization" },
              { setting: "trainable parameters", value: "binary classification head", notes: "new baseline freezes the backbone and its batch-normalization statistics" },
              { setting: "legacy initialization", value: "ImageNet ResNet-50", notes: "saved notebook has load_from=None; downloaded Kinetics checkpoint was not loaded" },
              { setting: "legacy selection", value: "best saved at epoch 1", notes: "inference cell instead loads epoch 20; not a new benchmark" },
            ]} />
          </>}>
          <p>
            The old notebook and the new baseline are different experiments.
            In the notebook, the backbone was not configured as frozen, the seed
            was unset, and the inherited test pipeline did not match validation.
            The command-line pipeline makes those choices explicit.
          </p>
        </Section>

        <section id="demo" className="scroll-mt-16 border-b border-rule py-8" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Demo</h2>
            <a href="/demo" className="py-2 text-sm text-ink-mute underline underline-offset-4 hover:text-ink">Open demo →</a>
          </div>
          <RecordedDemoPlayer />
        </section>
        <section id="try" className="border-b border-rule py-22">
          <div className="mb-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-red-600">§ 09 · Run locally</div>
          <h2 className="mb-7 max-w-[720px] font-serif text-[clamp(28px,3.5vw,40px)] font-normal leading-[1.15] tracking-[-0.01em] text-ink">
            Training and evaluation run from the repository.
          </h2>
          <div className="max-w-[760px]"><Upload /></div>
        </section>
        <footer className="py-14 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-dim">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <span>Strike · research in progress</span>
            <span className="font-serif text-[12px] italic normal-case tracking-normal">
              Built by <a href="https://thomasou.com/" className="text-ink hover:text-red-600">Thomas Ou</a>
            </span>
            <a href="https://github.com/Smokeybear10/100.RSCH.strike" className="hover:text-red-600">Repository</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
