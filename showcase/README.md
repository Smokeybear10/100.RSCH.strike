# Strike | Workspace and Demo

**Live: [strike.thomasou.com](https://strike.thomasou.com)**

Review local MMA footage, annotate strike attempts, and inspect saved model predictions.

## Quick Start

Run from this directory:

```bash
npm ci
npm run dev
```

Open http://localhost:2100. `/` opens `/workspace`; `/demo` contains recorded predictions with frame-by-frame playback.

## How It Works

Workspace keeps annotations in IndexedDB and supports JSON backup import and export. Videos stay on the user's device and must be reconnected after reloading. Model scores are imported from a Python run; the browser does not run inference or upload footage.

The demo reads committed scores and matching frames. Research notes and experiment results live in the [notebook](../model/notebooks/Research_Notes.ipynb).

## Checks

```bash
npm run lint
npm run build
npm start
```

Production also runs on port 2100. See the [repository README](../README.md) for the Python pipeline and project structure.

Built by Thomas Ou
