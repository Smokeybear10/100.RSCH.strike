# Working on Strike

Strike classifies short MMA video windows and provides a workspace for reviewing the labels. Start with the [research notebook](model/notebooks/Research_Notes.ipynb) for the evidence and limitations, and the [data protocol](PROJECT_OVERVIEW.md) before changing annotations or experiments.

## Local checks

For workspace or demo changes, run from the repository root:

```bash
cd showcase
npm ci
npm run lint
npm run build
```

Use `npm run dev` to open http://localhost:2100. Check the affected flow in `/workspace` or `/demo`, including a narrow screen. Use a disposable annotation project when testing imports, exports, or deletion.

For changes to saved research artifacts, run the verification cells in [Research_Notes.ipynb](model/notebooks/Research_Notes.ipynb) from the repository root. These use the Python standard library and check the recorded metrics and frame hashes; they do not establish model accuracy.

For new training runs, follow the [README](README.md) setup and the data protocol. Report the manifest fingerprint, fight split, seed, configuration, checkpoint, and per-fight results. Keep test fights separate from model selection, and preserve the same windows and settings when comparing raw and masked inputs.

## Changes and commits

Keep each change focused. Describe the behavior changed, the checks run, and any remaining limitations. Do not treat unreviewed demo scores as evaluation labels or benchmark results.

Use short, lowercase action messages under 72 characters, without conventional-commit prefixes or co-author trailers. Examples:

```text
fix annotation imports after reload
check frame hashes before evaluation
document training inputs and limitations
```

Keep credentials, private annotations, source footage, and model checkpoints out of Git. New third-party assets need a documented source and license; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
