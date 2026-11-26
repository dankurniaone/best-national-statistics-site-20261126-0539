// NusaStat hand-in (Node 22, standard library only).
//
// The site lives in app/ beside this file: plain static files, no build
// step, nothing loaded over the network. This program copies app/ and
// screenshots/ into the output directory and writes dossier.json there with
// the kit's vendored library, exactly as the scorer re-derives it. It runs
// twice in the grader and must write identical bytes both times.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(root, "app");
const shotsDir = join(root, "screenshots");

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, "app"), { recursive: true });
mkdirSync(join(outDir, "screenshots"), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outDir, "screenshots"), { recursive: true });
}

// Caps mirror the gate: at most 4 screenshots of 256 KiB, app/ under
// 993 files and 16 MiB, dossier text capped at 160 KiB.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
console.log(`handed in ${outDir} (${dossier.length} byte dossier)`);
