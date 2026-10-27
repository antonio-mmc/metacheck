import path from "node:path";
import { describe, expect, it } from "vitest";

import { classifyBytes } from "@/ingest/classify";
import { demoFiles } from "@/tests/demo-files";
import { classification } from "@/tests/expected/classification";

describe("classifier", () => {
  it("labels all 46 demo files from the contents, under random names", async () => {
    const files = demoFiles();
    expect(files).toHaveLength(46);
    const misses: string[] = [];
    for (const file of files) {
      const randomName = `doc-${Math.random().toString(36).slice(2)}${path.extname(file.relative)}`;
      expect(randomName).not.toBe(path.basename(file.relative));
      const result = await classifyBytes(file.bytes);
      const expected = classification[file.relative];
      if (result.kind !== expected) {
        misses.push(`${file.relative} → ${result.kind}, expected ${expected} (as ${randomName})`);
      }
    }
    expect(misses).toEqual([]);
  }, 120_000);
});
