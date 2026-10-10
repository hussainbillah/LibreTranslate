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
    if (statSync(p).isDirectory()) { if (!["fonts", "stills"].includes(f)) walk(p); }
    else if (/\.(js|mjs|py|html|css|md|srt)$/.test(f)) files.push(p);
  }
})(ROOT);

const problems = [];
const KEY = /\bsk_(?:dev_)?[A-Za-z0-9]{16,}/;
const BEARER = /Bearer\s+(?!\$SONICIUM_API_KEY|\$\{|<|\{api_key\}|YOUR_API_KEY|\$\{options)[A-Za-z0-9._-]{12,}/;
const CLAIMS = [/100\s*%/, /unhackable/i, /guaranteed security/i, /risk[- ]free/i, /ঝুঁকিমুক্ত/, /আনহ্যাকেবল/, /নিশ্চিত নিরাপত্তা/, /শতভাগ নিরাপদ/, /সম্পূর্ণ নিরাপদ/];
for (const f of files) {
  if (f.endsWith("check.mjs")) continue;
  const text = readFileSync(f, "utf8");
  const rel = f.slice(ROOT.length + 1);
  if (KEY.test(text)) problems.push(`${rel}: looks like a real API key`);
  if (BEARER.test(text)) problems.push(`${rel}: literal bearer token`);
  for (const c of CLAIMS) if (c.test(text) && !/\.(css|md)$/.test(rel)) problems.push(`${rel}: forbidden claim ${c}`);
  if (/র্যা/.test(text.replace(/র‍্যা/g, ""))) problems.push(`${rel}: র্যা without ZWJ`);
}

const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
let prevEnd = 0;
for (const s of ctx.SCRIPT.scenes) {
  for (const [a, b, text] of s.cues) {
    if (a < s.start || b > s.end) problems.push(`cue outside scene ${s.id}: ${text.slice(0, 30)}`);
    if (a < prevEnd) problems.push(`overlapping cue at ${a}`);
    const cps = [...text].length / (b - a);
    // Bengali vowel signs and virama are separate code points, so this is
    // generous compared with Latin characters-per-second guidelines.
    if (cps > 30) problems.push(`cue too fast (${cps.toFixed(1)} chars/s) at ${a}`);
    prevEnd = b;
  }
}

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`ok — ${files.length} files checked, no key-shaped strings, no absolute claims, cues valid`);
