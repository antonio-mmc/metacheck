import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { connection } from "next/server";

import { projects, type ProjectId } from "@/app/projects";
import { readProject, type ProjectReading } from "@/ingest/project";

const cached = new Map<ProjectId, Promise<ProjectReading>>();

/** Each demo company is read through the same readers as a dropped folder. */
export function loadProject(id: ProjectId): Promise<ProjectReading> {
  let reading = cached.get(id);
  if (!reading) {
    reading = readFolder(id);
    cached.set(id, reading);
  }
  return reading;
}

export function loadCompanyA(): Promise<ProjectReading> {
  return loadProject("a");
}

async function readFolder(id: ProjectId): Promise<ProjectReading> {
  await connection();
  const project = projects[id];
  const root = path.join(process.cwd(), "dados-demo");
  const paths = [
    ...readdirSync(path.join(root, project.folder)).map((name) => path.join(root, project.folder, name)),
    path.join(root, "avisos", project.callFile),
  ];
  return readProject(
    paths.map((full) => ({
      filename: path.basename(full),
      bytes: new Uint8Array(readFileSync(full)),
    })),
  );
}
