"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function motionLive() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** False on the server and during hydration, so the first paint matches. */
export function useMotionLive(): boolean {
  return useSyncExternalStore(subscribe, motionLive, () => false);
}
