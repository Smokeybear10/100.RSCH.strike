export function Upload() {
  return (
    <div className="border border-rule bg-paper p-8">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-red-600">
        Annotation workspace
      </div>
      <p className="font-serif text-xl text-ink">
        Review your footage. Build the dataset.
      </p>
      <p className="mt-3 max-w-[540px] font-serif text-[14px] leading-relaxed text-ink-dim">
        Open a local video, mark strike attempts, and save your annotations.
        Import real scores from a saved checkpoint to review disagreements.
        Footage stays on your computer; model inference runs through the local Python pipeline.
      </p>
      <a href="/workspace"
        className="mt-5 inline-block border border-rule px-4 py-2 font-mono text-[11px] text-ink hover:border-red-600 hover:text-red-600">
        Open annotation workspace →
      </a>
    </div>
  );
}
