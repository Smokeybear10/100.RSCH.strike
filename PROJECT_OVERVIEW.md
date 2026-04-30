# Strike | Data and Experiment Protocol

**Live demo: [strike.thomasou.com](https://strike.thomasou.com)**

Strike classifies five-frame windows for the presence of a strike attempt. A positive label does not require contact or damage.

## Label Definition

- **1 — strike attempt:** visible committed punch, kick, knee, or elbow directed toward the opponent, including a miss or block. Label the action visible in the window, not a later outcome.
- **0 — neutral:** no committed attempt in the window. Include guard adjustments, locomotion, grappling transitions, and clearly identifiable feints as negatives.
- **Ambiguous:** keep the clip unreviewed in development. Do not force uncertain motion, occluded limbs, or unclear feints into the research set.

Review the surrounding source footage when annotating. Record timestamps from the same source video, not the fight-clock overlay. A five-frame window need not contain the entire attempt. Replay segments and alternate camera views of the same fight belong to the same fight group. Adjacent windows are correlated observations, not independent fights.

The initial task is binary window classification. It does not measure landed-strike counts, fighter attribution, attempt boundaries, or event-level recall. Those require additional labels and evaluation.

The local annotation workspace stores `attempt`, `no_attempt`, `uncertain`, and `unreviewed` windows with source hashes, fight IDs, intervals, optional outcomes, and notes. `model.prepare` converts definitive labels to the binary manifest below and leaves the other windows in a separate review record. All workspace exports remain development data. Do not promote model-assisted or previously inspected windows to an untouched test partition.

Preparation records five distinct frames sampled evenly by decoded frame index inside each marked interval. Their exact presentation timestamps, video hash, decoder versions, and image hashes are saved in `review.json`. Keep windows short and focused: five samples from a long interval may miss an action. Nonzero playback origins and unsupported display transforms are refused to avoid silently misaligning browser annotations and extracted frames.

`model.predict` uses the saved checkpoint's original preprocessing and verifies its training record before scoring prepared windows. The workspace binds imported scores to the project, video hash, clip IDs, and interval boundaries. Scores remain separate from human labels. Editing an interval removes that score, and uncertain labels never become negative training examples by default. Prediction review does not produce benchmark accuracy.

## Manifest

A manifest is JSON with `schema_version: 1`, `label_definition: "strike_attempt"`, and a nonempty `clips` array. An example record:

```json
{
  "schema_version": 1,
  "label_definition": "strike_attempt",
  "clips": [
    {
      "clip_id": "fight-001-camera-a-012",
      "fight_id": "fight-001",
      "source": "owned-or-authorized-source-video-id",
      "start_time_s": 42.0,
      "end_time_s": 42.166667,
      "label": 1,
      "annotation_status": "reviewed",
      "split": "train",
      "frames": [
        "raw/clip-012/img_00001.jpg",
        "raw/clip-012/img_00002.jpg",
        "raw/clip-012/img_00003.jpg",
        "raw/clip-012/img_00004.jpg",
        "raw/clip-012/img_00005.jpg"
      ],
      "masked_frames": [
        "masked/clip-012/img_00001.jpg",
        "masked/clip-012/img_00002.jpg",
        "masked/clip-012/img_00003.jpg",
        "masked/clip-012/img_00004.jpg",
        "masked/clip-012/img_00005.jpg"
      ]
    }
  ]
}
```

This illustrates one record, not a trainable dataset. Training needs nonempty train and validation partitions, with both classes in training. Final evaluation needs a separate test partition. Paths are relative to `--data-root` and must stay inside it, including after resolving symlinks. List exactly five distinct, readable frames in chronological order. `masked_frames` is optional for raw-only work; include all corresponding masked frames before starting paired experiments.

Use stable source/fight IDs without surrounding whitespace. The audit can detect shared IDs and image content, but cannot infer whether two differently named videos depict the same fight. Human provenance review remains necessary. Content hashes cannot establish footage rights or annotation correctness.

## Split Policy

Assign complete fights, including replays, to one of `train`, `val`, or `test`. Do not split randomly by clip: fighters, camera, broadcast graphics, and nearby moments can otherwise leak across partitions. Build enough separate fights to cover both classes and different styles, angles, and events. A three-fight split satisfies separation mechanically but still gives a fragile estimate.

Development manifests allow unknown source metadata and unreviewed labels. Research manifests reject development clips, unknown provenance, and unreviewed labels. A development run cannot be evaluated as a test run.

The importer preserves legacy membership in `legacy_splits` but assigns all imported examples to `development`. It records `label_definition: "legacy_unknown"`; each old label needs review against the new attempt definition before reuse. Previously inspected footage must not become a supposedly untouched test set just by editing its split field.

The audit checks frame readability, raw/masked pairing, duplicate clip IDs, conflicting labels on identical complete raw windows, content duplicates across splits, fight overlap, timestamps, and required fields. Partial overlap within a split is reported separately because adjacent windows may legitimately have different labels. It returns a fingerprint covering the manifest and every declared raw/masked frame. Evaluation refuses a dataset whose fingerprint differs from training.

Imports, audit reports, run directories, and comparisons require new output paths. Evaluation and comparison check the checkpoint against its training-time hash in `validation_metrics.json`. Evaluation records the hash of the exact checkpoint bytes it loaded; comparison verifies and parses the same prediction bytes, so replacing a file mid-read cannot silently attribute results to a different artifact. Custom test output directories are supported with comparison's `--raw-evaluation` and `--masked-evaluation` options.

## Experiment Protocol

1. Review labels and provenance. Audit the complete manifest before running a model.
2. Freeze the fight assignments and preserve a genuinely untouched test partition.
3. Train the raw appearance baseline. Select the best epoch by validation loss, not training accuracy.
4. Train its masked counterpart with the same manifest, seed, settings, and preprocessing. Inspect paired validation predictions and errors by fight.
5. Freeze preprocessing, threshold, model selection, and experiment design. Evaluate test once for the final report; repeated test-guided changes turn it into development data. The CLI records provenance but cannot police research decisions outside it.

The default threshold is 0.5. Do not tune it on test labels. Average precision summarizes ranking; precision/recall/F1 describe the selected threshold. Brier score and log loss describe probability quality, but neither makes these scores calibrated probabilities by itself. Always report sample counts and fight counts alongside metrics.

For a raw/masked comparison, `model.compare` verifies matching code, inputs, labels, splits, seed, and settings. It recalculates metrics from per-clip probabilities and reports which examples change correctness. Different selected epochs are permitted because each run uses the same validation selection rule. Differences from one small experiment are descriptive, not proof that masking helps.

## Historical Evidence

The legacy files contain 38 distinct clips: 19 labeled strike, 19 neutral, five frames each. The annotation files name 30 training clips, six validation clips, and two test clips. Both test clips also occur in validation; two other clips are unused. These counts describe the files, not an independently validated dataset.

The supplied frames contain raw broadcast footage. Source metadata is missing; a checked frame shows Gaethje–Holloway, so the earlier blanket Topuria–Holloway attribution is unsupported. The historical notebook reads a personal Drive path, so its actual input preprocessing cannot be established from the checked-in frames alone.

The saved TSN configuration uses ImageNet ResNet-50 initialization and `load_from=None`. Downloading a Kinetics checkpoint in a different cell did not connect it to training. The backbone was not explicitly frozen. The recorded validation accuracy reaches 100% early and ends at 50% after 20 epochs on six clips. Inference then selects epoch20 rather than the saved best-validation checkpoint. No independent held-out evaluation is recorded.

The current exporter reads those logs directly and embeds the notebook hash and output-cell index in the chart artifact. It does not reconstruct missing measurements. Illustrative film-room confidence traces are not predictions from that run.

Built by Thomas Ou
