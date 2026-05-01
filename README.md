# Strike | MMA Action Recognition

**Live demo: [Recorded predictions](https://strike.thomasou.com/demo) · [Annotation workspace](https://strike.thomasou.com/workspace)**

Strike studies whether masking the background improves strike-attempt classification on unseen MMA fights.

[Research notebook](model/notebooks/Research_Notes.ipynb) · [Data and evaluation protocol](PROJECT_OVERVIEW.md)

## Method

The current baseline averages frozen ResNet-50 features from five frames and trains a binary linear classifier. It does not model frame order. A positive label means a committed strike attempt, including a miss or block; it does not count landed strikes.

The planned experiment compares raw and masked versions of the same windows, with entire fights held out for testing. The training and comparison code is in [`model/`](model/).

## Results so far

The original pilot contains 38 windows. A historical TSN run, separate from the current baseline, ended at:

| Partition | Windows | Accuracy at epoch 20 |
| --- | ---: | ---: |
| Training | 30 | 100% |
| Validation | 6 | 50% |

The two original test windows also appear in validation. **There is no independent test result or measured benefit from masking.**

The demo shows 120 recorded predictions from a separate frozen-ResNet development model. Its clips have no reviewed ground-truth labels, and its scores are uncalibrated. The notebook contains the saved logs, provenance checks, and full limitations.

## Run locally

Clone the repository:

```bash
git clone https://github.com/Smokeybear10/100.RSCH.strike.git
cd 100.RSCH.strike
```

For experiments, use Python 3.11:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install -r model/requirements.txt
```

The [notebook](model/notebooks/Research_Notes.ipynb) has the preparation, training, and evaluation commands. New runs require reviewed frames and a manifest following the data protocol. Source videos and trained checkpoints are not included. The notebook's existing verification cells use only the Python standard library.

For the annotation workspace and demo, use Node.js 20.9+:

```bash
cd showcase
npm ci
npm run dev
```

Open http://localhost:2100. The workspace saves labels locally and exports them for the Python pipeline. Videos stay on your device; inference runs separately in Python.

![Strike demo showing recorded predictions alongside source footage](assets/demos/strike-demo.png)

## License

Original code and documentation: [MIT](LICENSE). Artwork, broadcast footage, dependencies, datasets, and pretrained weights have separate terms; see [third-party notices](THIRD_PARTY_NOTICES.md).

Built by Thomas Ou
