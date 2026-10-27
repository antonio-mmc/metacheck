import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type DemoFile = {
  relative: string;
  bytes: Uint8Array;
};

export function demoFiles(): DemoFile[] {
  const root = path.join(process.cwd(), "dados-demo");
  const found: DemoFile[] = [];
  const walk = (directory: string) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (entry.name === "README.md") continue;
      found.push({
        relative: path.relative(root, full).replaceAll("\\", "/"),
        bytes: new Uint8Array(readFileSync(full)),
      });
    }
  };
  walk(root);
  return found;
}

export function companyAInputs(): { filename: string; bytes: Uint8Array }[] {
  return demoFiles()
    .filter(
      (file) =>
        file.relative.startsWith("empresa-a/") ||
        file.relative === "avisos/aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf",
    )
    .map((file) => ({ filename: path.basename(file.relative), bytes: file.bytes }));
}
