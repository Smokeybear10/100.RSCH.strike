# Strike | MMA Video Review

**Live: [Workspace](https://strike.thomasou.com/workspace) · [Recorded demo](https://strike.thomasou.com/demo)**

Label strike attempts in fight footage and compare them with saved model predictions.

[![Strike demo with fight footage, playback controls, and recorded model scores](assets/demos/strike-demo.png)](https://strike.thomasou.com/demo)

## Quick Start

```bash
git clone https://github.com/Smokeybear10/100.RSCH.strike.git
cd 100.RSCH.strike/showcase
npm ci
npm run dev
```

Open http://localhost:2100. The homepage opens Workspace; Demo is the other tab. Neither needs an account or a Python environment.

## What It Does

**Workspace**

- Review local fight footage and mark short windows as attempt, no attempt, or uncertain. Blocked and missed strikes count as attempts.
- Record contact outcomes and notes separately. Filter the queue by unfinished labels, uncertainty, or disagreements with model scores.
- Save annotations in the browser and export JSON backups. Reconnect the original video after reloading; footage is never uploaded or stored in the annotation database.
- Import saved predictions without changing human labels. Editing a window's boundaries removes its old score.

Use `I` / `O` for in/out points, `1` / `2` / `3` to label, `N` for a new window, and arrow keys to seek by 0.1 seconds. Unsaved window edits are protected when switching projects or leaving the page.

**Recorded demo**

Three fight sequences play alongside their saved checkpoint predictions. Pause, seek, or step between five-frame windows to inspect the footage and corresponding score. These are recorded outputs, not inference running in the browser.

**Python pipeline**

Prepare timestamped frames from annotated footage, audit dataset splits, train raw or masked baselines, and export predictions back to Workspace. Runs record configuration, source hashes, checkpoints, and per-window metrics so results can be traced to their inputs.

## Score Your Footage

Python 3.11. From the repository root:

```bash
uv venv --python 3.11
uv pip install --python .venv/bin/python -r model/requirements.txt
source .venv/bin/activate
```

Export an annotation backup from Workspace, then use a completed raw-model training run:

```bash
python -m model.prepare --annotations annotations.json --video /path/to/footage.mp4 --output data-local/reviewed
python -m model.predict --prepared data-local/reviewed --run runs/your-raw-run --output runs/workspace-review
```

Import `runs/workspace-review/predictions.json` into Workspace. `runs/your-raw-run` must contain a trained checkpoint and its run records; weights and source videos are not included in this repository. Use new output directories for each run. See the [research notebook](model/notebooks/Research_Notes.ipynb) for training commands and the [data protocol](PROJECT_OVERVIEW.md) for labels, manifests, and fight-level splits.

## Research

[Research_Notes.ipynb](model/notebooks/Research_Notes.ipynb) contains the methods, saved experiment results, provenance checks, and reproduction commands. Its verification cells run with the Python standard library. The original [TSN](model/notebooks/TSN_Pipeline.ipynb) and [3D-CNN](model/notebooks/3DCNN_Pipeline.ipynb) notebooks remain available.

The current baseline averages frozen ImageNet ResNet-50 features across five frames and trains a linear classifier. It models appearance rather than motion order. The original dataset has 38 windows, with overlapping historical validation and test examples; accuracy on unseen fights has not been established. Demo scores are uncalibrated and are not strike counts.

## Tech Stack

| Layer | Tools |
|---|---|
| Workspace and demo | Next.js, React, TypeScript, CSS modules, Tailwind CSS |
| Local annotations | IndexedDB, JSON backups, SHA-256 video checks |
| Frame preparation | Python, PyAV, Pillow |
| Model and evaluation | PyTorch, torchvision, ResNet-50 |
| Research | Jupyter notebooks, MMAction2 TSN, SAM2 experiments |

## Project Structure

```text
showcase/src/app/
  workspace/                 # Local video review and annotations
  demo/                      # Recorded predictions and playback
showcase/src/lib/
  recorded-demo.json         # Saved scores and frame provenance
model/
  annotations.py             # Workspace export validation
  prepare.py                 # Timestamped frame extraction
  predict.py                 # Checkpoint scores for review
  data.py                    # Manifest validation and leakage audit
  baseline.py                # Frozen encoder and classifier
  train.py                   # Training and checkpoint selection
  evaluate.py                # Separate test evaluation
  compare.py                 # Paired raw/masked comparisons
  notebooks/                 # Research notes and original experiments
PROJECT_OVERVIEW.md           # Data and experiment protocol
```

Built by Thomas Ou
