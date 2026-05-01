# Strike | MMA Action Recognition Research

**Live demo: [Recorded predictions](https://strike.thomasou.com/demo) · [Annotation workspace](https://strike.thomasou.com/workspace)**

Strike studies strike-attempt classification in MMA footage. The central question is whether isolating fighters from the broadcast background improves generalization to unseen fights.

## Research Record

The [research notebook](model/notebooks/Research_Notes.ipynb) contains the study question, methods, saved results, and executable artifact checks. Its saved outputs can be read on GitHub without installing anything. The [experiment protocol](PROJECT_OVERVIEW.md) defines labels, fight-level splits, and the paired comparison. Implementation lives in [`model/`](model/); the website supports annotation and inspection of recorded outputs.

The evidence is a 38-window pilot and recorded development predictions. **Accuracy on unseen fights has not been established, and there is no measured raw-versus-masked result.**

[Check saved artifacts](#check-the-saved-artifacts) · [Run an experiment](#run-a-new-experiment) · [Data protocol](PROJECT_OVERVIEW.md)

## Method and Comparison

The target is a **strike attempt**, including a blocked or missed punch, kick, knee, or elbow. Contact is a separate annotation. Uncertain windows stay outside the binary training labels.

The current [appearance baseline](model/baseline.py) freezes an ImageNet ResNet-50, averages the feature vectors from five frames, and trains a two-class linear head. Frames are resized to a 256-pixel short edge, center-cropped to 224 pixels, and normalized with ImageNet statistics. Averaging discards frame order, so this baseline does not explicitly model motion direction or timing.

The experiment code supports raw and masked inputs from the same windows. A controlled comparison requires matching fight assignments, labels, seed, preprocessing, and training settings. Checkpoint selection uses validation loss; reserved test fights are evaluated separately. The [data protocol](PROJECT_OVERVIEW.md) defines the manifest, annotation rules, leakage checks, and comparison procedure.

Masking could remove broadcast shortcuts, but it could also discard useful context or obscure limbs. The comparison therefore needs both variants on the same reserved fights, with per-fight metrics and paired errors. The notebook sets out the planned comparison and its remaining data requirements. A benefit from masking has not been measured.

## What the Saved Runs Show

The historical MMAction2 TSN run is separate from the current frozen-backbone baseline. Its [exported logs](showcase/src/lib/legacy-training.json) record the following at epoch 20:

| Historical partition | Windows | Accuracy |
| --- | ---: | ---: |
| Training | 30 | 100% |
| Validation | 6 | 50% |
| Independent test | — | Not recorded |

Validation accuracy was 100% at epochs 1 and 2, also on just six windows. Both clips called “test” in the original annotation files also appear in validation. The collection has 38 distinct windows, with two outside those partitions; its old labels need review against the current attempt definition. These results do not estimate performance on new fights.

The [recorded demo export](showcase/src/lib/recorded-demo.json) comes from a separate frozen-ResNet development checkpoint trained on the 38 pilot windows. It contains 120 scored windows across three sequences, with hashes for all 600 displayed frames. Those sequences have no reviewed ground-truth labels or benchmark metrics. The scores are uncalibrated, and threshold crossings are not counts of individual strikes.

## Check the Saved Artifacts

Clone the repository, then run the notebook's verification cells from the repository root with Python 3.11 or later:

```bash
git clone https://github.com/Smokeybear10/100.RSCH.strike.git
cd 100.RSCH.strike
python3 - <<'PY'
import json
from pathlib import Path

notebook = json.loads(Path("model/notebooks/Research_Notes.ipynb").read_text())
namespace = {}
for index, cell in enumerate(notebook["cells"]):
    if cell["cell_type"] == "code":
        exec(compile("".join(cell["source"]), f"cell-{index}", "exec"), namespace)
PY
```

This uses only the Python standard library. It checks the historical notebook fingerprint and exported metrics, verifies the 600 frame hashes and 120 window records, and prints the saved summaries. It does not download data, write files, rerun neural inference, or measure prediction accuracy.

The original [TSN](model/notebooks/TSN_Pipeline.ipynb) and [3D-CNN](model/notebooks/3DCNN_Pipeline.ipynb) notebooks are retained as experiment records. The historical TSN notebook uses a personal Drive path; its original training environment and inputs are not a self-contained reproduction. Trained checkpoints and source videos are not included.

## Run a New Experiment

Use Python 3.11. Install the pinned [model dependencies](model/requirements.txt) from the repository root:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r model/requirements.txt
```

These commands require your own reviewed manifest and frames following [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md). Assign entire fights, including replays, to train, validation, or test. Workspace exports are development data; they do not provide an untouched test set. For the paired experiment, include matching raw and masked frames for every window.

```bash
python -m model.data audit --manifest data-local/reviewed.json --data-root /path/to/frames --output runs/data-audit.json
python -m model.train --manifest data-local/reviewed.json --data-root /path/to/frames --output runs/raw --variant raw
python -m model.train --manifest data-local/reviewed.json --data-root /path/to/frames --output runs/masked --variant masked
```

The default run uses CPU, seed 42, and 20 epochs. ImageNet weights download on first use. The run saves its configuration, dataset audit, training history, selected checkpoint, and per-window validation predictions. Use new output paths for each experiment.

After freezing the design and model choice, evaluate the reserved test fights:

```bash
python -m model.evaluate --run runs/raw --manifest data-local/reviewed.json --data-root /path/to/frames
python -m model.evaluate --run runs/masked --manifest data-local/reviewed.json --data-root /path/to/frames
python -m model.compare --raw runs/raw --masked runs/masked --split test --output runs/comparison.json
```

Each run writes `evaluation/test_metrics.json` and `test_predictions.csv`, including per-fight metrics. `runs/comparison.json` records masked-minus-raw differences and paired prediction changes after checking that the runs match. The notebook has the preparation and prediction-import commands. These commands describe the experiment workflow; the independent dataset and resulting comparison are still outstanding.

## Supporting Research Tools

The browser workspace labels local footage, saves annotations in IndexedDB, and exports JSON backups for the Python workflow. The demo lets readers inspect recorded model outputs against the input frames. Videos stay on the device and must be reconnected after reloading. Saved model scores can be imported without replacing human labels. Inference runs separately in Python.

![Recorded predictions alongside their source frames in Strike](assets/demos/strike-demo.png)

To run the workspace and recorded demo locally:

```bash
cd showcase
npm ci
npm run dev
```

Open http://localhost:2100. `/` opens the workspace; `/demo` plays the committed predictions. See [showcase/README.md](showcase/README.md) for frontend checks.

## Limits

The pilot lacks complete fight identities and source timestamps. Neighboring windows are correlated, the old validation and test memberships overlap, and the displayed demo footage has no reviewed labels. More windows from those sequences would not establish generalization.

The current task classifies windows. It does not establish landed-strike counts, fighter attribution, event boundaries, calibrated probabilities, or the benefit of segmentation. Answering the original question requires reviewed examples from separate fights and a matched raw/masked evaluation on reserved footage.

## License

Original code and documentation are available under the [MIT License](LICENSE). Third-party artwork, broadcast-derived demo media, dependencies, datasets, and pretrained weights retain their own terms; see [third-party notices](THIRD_PARTY_NOTICES.md).

Local checks and commit conventions are in [CONTRIBUTING.md](CONTRIBUTING.md).

Built by Thomas Ou
