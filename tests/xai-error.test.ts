import { describe, expect, it } from "vitest";

import { publicModelError } from "@/ai/xai";

describe("model error", () => {
  it("keeps the status and the body, and drops the key", () => {
    const key = "xai-secret-key-value";
    const message = publicModelError(410, `{"error":"gone","echo":"${key}"}`, key);
    expect(message).toContain("410");
    expect(message).toContain("gone");
    expect(message).not.toContain(key);
    expect(message).not.toContain("secret-key");
  });
});
