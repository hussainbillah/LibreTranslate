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
    else if (/\.(js|mjs|py|html|css|md|srt)$/.test(f) && f !== "map.js") files.push(p);
  }
})(ROOT);

const problems = [];
const KEY = /\bsk_(?:dev_)?[A-Za-z0-9]{16,}/;
const BEARER = /Bearer\s+(?!\$SONICIUM_API_KEY|\$\{|<|\{api_key\}|YOUR_API_KEY|\$\{options)[A-Za-z0-9._-]{12,}/;
const CLAIMS = [/100\s*%/, /unhackable/i, /guaranteed security/i, /risk[- ]free/i, /ঝুঁকিমুক্ত/, /আনহ্যাকেবল/, /নিশ্চিত নিরাপত্তা/, /শতভাগ নিরাপদ/, /সম্পূর্ণ নিরাপদ/, /সরকার অনুমোদিত/, /অনুমোদন পেয়েছে/, /প্রথম কোয়ান্টাম/, /শূন্য ঝুঁকি/, /world.?s first/i, /market leader/i, /guaranteed (return|revenue|profit)/i, /provably fair/i, /certified fair/i, /increases? (your )?(winnings|revenue|house edge)/i];
for (const f of files) {
  if (f.endsWith("check.mjs")) continue;
  const text = readFileSync(f, "utf8");
  const rel = f.slice(ROOT.length + 1);
  if (KEY.test(text)) problems.push(`${rel}: looks like a real API key`);
  if (BEARER.test(text)) problems.push(`${rel}: literal bearer token`);
  // A claim counts only when it is not negated in the 60 characters before it ("not a guaranteed return",
  // "does not increase revenue" are the disclaimers the brief asks for).
  const NEG = /\b(not|no|never|nor|without|cannot|doesn.t|does not)\b[^.]{0,60}$/i;
  for (const c of CLAIMS) {
    if (/\.(css|md)$/.test(rel)) continue;
    const g = new RegExp(c.source, c.flags.includes("g") ? c.flags : c.flags + "g");
    for (const m of text.matchAll(g)) if (!NEG.test(text.slice(Math.max(0, m.index - 60), m.index))) { problems.push(`${rel}: forbidden claim ${c}`); break; }
  }
  // ZWJ belongs after word-initial র or র-ফলা (র‍্যান্ডম, ট্র‍্যাক), never in the reph form (পর্যায়)
  if (/(^|[^অ-হা-ৌৗড়-য়])র্যা/m.test(text)) problems.push(`${rel}: word-initial র্যা without ZWJ`);
  if (/[অ-হা-ৌৗড়-য়]র‍্য/.test(text)) problems.push(`${rel}: ZWJ in reph form (e.g. পর্যায়)`);
}

const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
for (const lang of ctx.SCRIPT.langs) {
  const T = {};
  vm.runInNewContext(readFileSync(join(ROOT, `src/timing.${lang}.js`), "utf8").replace("window.TIMING", "globalThis.TIMING"), T);
  let ti = 0, prevEnd = 0;
  ctx.SCRIPT.scenes.forEach((s, i) => {
    const [s0, s1] = T.TIMING.scenes[i];
    for (const text of s.cues[lang]) {
      const [a, b] = T.TIMING.cues[ti++];
      if (a < s0 || b > s1) problems.push(`${lang}: cue outside scene ${s.id}: ${text.slice(0, 30)}`);
      if (a < prevEnd) problems.push(`${lang}: overlapping cue at ${a}`);
      prevEnd = b;
    }
  });
  if (ti !== T.TIMING.cues.length) problems.push(`${lang}: timing has ${T.TIMING.cues.length} cues, script has ${ti}`);
  let pe = 0;
  for (const [a, b, text] of T.TIMING.subs) {
    if (a < pe - 0.001) problems.push(`${lang}: overlapping subtitle at ${a}`);
    // Bengali vowel signs and virama are separate code points, so this is generous.
    if ([...text].length / (b - a) > (lang === "en" ? 25 : 30)) problems.push(`${lang}: subtitle too fast at ${a}: ${text.slice(0, 30)}`);
    pe = b;
  }
  if (T.TIMING.duration > 300) problems.push(`${lang}: ${T.TIMING.duration}s is over the 5-minute limit`);
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`ok — ${files.length} files checked, no key-shaped strings, no absolute claims, cues valid`);
