// Pre-publish checks over the sources, subtitles and demo code:
//   1. credential leaks — anything shaped like a real Sonicium key (sk_ / sk_dev_
//      followed by a long token) or a bearer token other than the env var/placeholder
//   2. forbidden absolute-security claims (Bengali and English)
//   3. Bengali "র‍্য" spelled without ZWJ (renders as reph instead of র-ফলা + য-ফলা)
//   4. subtitle cues: inside their scene, non-overlapping, not too fast to read
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) { if (!["fonts", "stills", "node_modules"].includes(f)) walk(p); }
    else if (/\.(js|mjs|py|html|css|md|srt)$/.test(f) && !p.includes("vendor")) files.push(p);
  }
})(ROOT);

const problems = [];
const KEY = /\bsk_(?:dev_)?[A-Za-z0-9]{16,}/;
const BEARER = /Bearer\s+(?!\$SONICIUM_API_KEY|\$\{|<|\{api_key\}|YOUR_API_KEY|\$\{options)[A-Za-z0-9._-]{12,}/;
// Misconceptions the chapter itself warns against; on-screen text must never assert them.
const CLAIMS = [/সব কাজে দ্রুত(?!\s*নয়)/, /একসঙ্গে সব উত্তর (বের|পড়ে)/, /(?<!নয় যে[^।]*)আলোর চেয়ে দ্রুত বার্তা পাঠানো (যায়|সম্ভব)(?!\s*(না|নয়))/, /অসীম (পরিমাণ )?তথ্য (রাখে|ধরে)/, /faster than light/i, /tries all answers/i];
for (const f of files) {
  if (f.endsWith("check.mjs")) continue;
  const text = readFileSync(f, "utf8");
  const rel = f.slice(ROOT.length + 1);
  if (KEY.test(text)) problems.push(`${rel}: looks like a real API key`);
  if (BEARER.test(text)) problems.push(`${rel}: literal bearer token`);
  for (const c of CLAIMS) if (c.test(text) && !/\.(css|md)$/.test(rel)) problems.push(`${rel}: forbidden claim ${c}`);
  // ZWJ belongs after word-initial র or র-ফলা (র‍্যান্ডম, ট্র‍্যাক), never in the reph form (পর্যায়)
  if (/(^|[^অ-হা-ৌৗড়-য়])র্যা/m.test(text)) problems.push(`${rel}: word-initial র্যা without ZWJ`);
  if (/[অ-হা-ৌৗড়-য়]র‍্য/.test(text)) problems.push(`${rel}: ZWJ in reph form (e.g. পর্যায়)`);
}

const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
vm.runInNewContext(readFileSync(join(ROOT, "src/timing.js"), "utf8").replace("window.TIMING", "globalThis.TIMING"), ctx);
let ti = 0;
ctx.SCRIPT.scenes.forEach((sc, i) => { [sc.start, sc.end] = ctx.TIMING.scenes[i]; });
let prevEnd = 0;
for (const s of ctx.SCRIPT.scenes) {
  for (const { t: text } of s.cues) {
    const [a, b] = ctx.TIMING.cues[ti++];
    if (a < s.start || b > s.end) problems.push(`cue outside scene ${s.id}: ${text.slice(0, 30)}`);
    if (a < prevEnd) problems.push(`overlapping cue at ${a}`);
    prevEnd = b;
  }
}

let pe = 0;
for (const [a, b, text] of ctx.TIMING.subs) {
  if (a < pe - 0.001) problems.push(`overlapping subtitle at ${a}`);
  // Bengali vowel signs and virama are separate code points, so this is
  // generous compared with Latin characters-per-second guidelines.
  if ([...text].length / (b - a) > 30) problems.push(`subtitle too fast at ${a}: ${text.slice(0, 30)}`);
  pe = b;
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`ok — ${files.length} files checked, no key-shaped strings, no absolute claims, cues valid`);
if (Math.abs(ctx.TIMING.duration - 671.8) > 0.2) { console.error(`duration ${ctx.TIMING.duration}s does not match the 11:11.8 voice-over`); process.exit(1); }
