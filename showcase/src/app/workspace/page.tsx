import type { Metadata } from "next";
import { Workspace } from "./workspace";

export const metadata: Metadata = {
  title: "Strike — Annotation workspace",
  description: "Review local footage, label strike attempts, and inspect saved model predictions.",
};

export default function WorkspacePage() {
  return <Workspace />;
}
