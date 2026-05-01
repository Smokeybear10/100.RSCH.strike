import type { Metadata } from "next";
import { Workspace } from "./workspace";

export const metadata: Metadata = {
  title: "Strike — Annotation workspace",
  description: "Annotate MMA strike attempts and export reviewed windows for Strike's research pipeline.",
};

export default function WorkspacePage() {
  return <Workspace />;
}
