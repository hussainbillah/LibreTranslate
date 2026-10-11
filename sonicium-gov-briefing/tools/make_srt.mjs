// Writes output/sonicium-bangladesh-briefing-bn.srt from the cues in src/script.js,
// so the burned-in subtitles and the .srt file can never drift apart.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
vm.runInNewContext(readFileSync(join(ROOT, "src/timing.js"), "utf8").replace("window.TIMING", "globalThis.TIMING"), ctx);

const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};

const cues = ctx.TIMING.subs.map(([a, b, text]) => [a, b, text]);
const srt = cues.map(([a, b, text], i) => `${i + 1}\n${ts(a)} --> ${ts(b)}\n${text}\n`).join("\n");
mkdirSync(join(ROOT, "output"), { recursive: true });
writeFileSync(join(ROOT, "output/sonicium-bangladesh-briefing-bn.srt"), srt, "utf8");
console.log(`wrote output/sonicium-bangladesh-briefing-bn.srt (${cues.length} cues)`);
