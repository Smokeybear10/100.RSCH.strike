import Link from "next/link";
import { Ticker } from "@/components/paper/ticker";

export default function NotFound() {
  return (
    <>
      <Ticker />
      <main id="main" className="mx-auto max-w-[1040px] px-4 py-16 sm:px-8" tabIndex={-1}>
        <p className="mb-3 text-sm text-ink-mute">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-4 max-w-lg text-base text-ink-mute">
          This address doesn’t match a page on Strike. Open the workspace to review footage, or try the demo.
        </p>
        <Link href="/workspace" className="mt-6 inline-block py-2 text-sm underline underline-offset-4 focus-visible:outline-ink focus-visible:outline-2">
          Open workspace
        </Link>
      </main>
    </>
  );
}
