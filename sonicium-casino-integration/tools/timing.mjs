// Generates src/timing.js: video length, scene bounds, cue times and subtitle
// chunks.
//
//   node tools/timing.mjs --voice output/voiceover.mp3   # measured from the voice-over
//   node tools/timing.mjs                                # estimated from text length
//
// With --voice, speech blocks are found with ffmpeg silencedetect and matched
// to the script's sentences in order by a dynamic-programming alignment: each
// sentence takes a run of consecutive blocks whose length best fits its
// letter count, and sentence boundaries are steered onto the longer pauses
// (sentence ends are ~0.4-0.5 s in ElevenLabs output, commas ~0.2-0.3 s).
// The video then runs for the whole voice-over plus a short musical tail.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
const S = ctx.SCRIPT;
const args = process.argv.slice(2);
const voice = args.includes("--voice") ? args[args.indexOf("--voice") + 1] : null;
const LANG = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : "en";
if (!S.langs.includes(LANG)) throw new Error(`--lang must be one of ${S.langs}`);

// Estimate mode uses the pace measured on the previous ElevenLabs narration (0.0753 s/letter).
// English is paced by words (~150 wpm), Bengali by letters (the previous ElevenLabs Bengali pace).
const RATE = LANG === "en" ? 0.4 / 6 : 0.0753, PAUSE = 0.42, SCENE_GAP = 0.8, TAIL = 4.5;
const letters = LANG === "en" ? (t) => t.split(/\s+/).filter(Boolean).length * 6 : (t) => [...t.replace(/[\s—,।:;.?\-]/g, "")].length;
const flat = S.scenes.flatMap((sc, si) => sc.cues[LANG].map((text) => ({ si, text, L: letters(text) })));
let cues, voiceDur = 0;
const report = [];

if (voice) {
  const log = execFileSync("sh", ["-c", `ffmpeg -hide_banner -i "${voice}" -af silencedetect=noise=-38dB:d=0.18 -f null - 2>&1`], { encoding: "utf8" });
  voiceDur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voice], { encoding: "utf8" }));
  const ss = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]);
  const se = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  const segs = [];
  let cur = 0;
  for (let i = 0; i < ss.length; i++) { if (ss[i] - cur > 0.12) segs.push([cur, ss[i]]); cur = se[i] ?? voiceDur; }
  if (voiceDur - cur > 0.12) segs.push([cur, voiceDur]);
  const n = flat.length, m = segs.length;
  if (m < n) throw new Error(`voice has ${m} speech blocks but the script has ${n} sentences`);
  const D = segs.map(([a, b]) => b - a);
  const gapAfter = segs.map((s, j) => (segs[j + 1] ? segs[j + 1][0] - s[1] : 1));
  const rate = D.reduce((a, b) => a + b, 0) / flat.reduce((a, c) => a + c.L, 0);
  const memo = new Map();
  const f = (i, j) => {
    if (i === n) return j === m ? [0, null] : [Infinity, null];
    const key = i * 4096 + j;
    if (memo.has(key)) return memo.get(key);
    let best = [Infinity, null], acc = 0;
    for (let k = j + 1; k <= m - (n - i - 1); k++) {
      acc += D[k - 1];
      const exp = Math.max(0.6, flat[i].L * rate);
      let e = ((acc - exp) / exp) ** 2;
      if (i < n - 1) e += 0.6 * Math.max(0, (0.4 - gapAfter[k - 1]) / 0.4); // boundary on a short pause
      if (e > 4) break;
      const r = f(i + 1, k);
      if (r[0] + e < best[0]) best = [r[0] + e, k];
    }
    memo.set(key, best);
    return best;
  };
  // One speech block per sentence needs no search (and must not fail on an unusually paced line).
  const [cost] = m === n ? [0] : f(0, 0);
  if (!isFinite(cost)) throw new Error("alignment failed");
  cues = [];
  if (m === n) cues = segs.map(([a, b]) => [a, b]);
  else for (let i = 0, j = 0; i < n; i++) { const k = f(i, j)[1]; cues.push([segs[j][0], segs[k - 1][1]]); j = k; }
  report.push(`voice ${voiceDur.toFixed(1)}s, ${m} speech blocks → ${n} sentences, ${rate.toFixed(4)} s/letter, cost ${cost.toFixed(2)}`);
  cues.forEach(([a, b], i) => {
    const exp = flat[i].L * rate, r = (b - a) / exp;
    if (r < 0.7 || r > 1.4) report.push(`  check cue ${i + 1} (${a.toFixed(1)}–${b.toFixed(1)}s, ${r.toFixed(2)}× expected): ${flat[i].text.slice(0, 40)}…`);
  });
} else {
  cues = [];
  let t = 1.2;
  flat.forEach((c, i) => {
    if (i && c.si !== flat[i - 1].si) t += SCENE_GAP;
    const d = c.L * RATE;
    cues.push([t, t + d]);
    t += d + PAUSE;
  });
}

// Scene bounds follow the narration: a scene starts just before its first
// sentence (never before the previous sentence has finished) and runs until
// the next scene starts. The last scene holds for a musical tail.
const firstCue = S.scenes.map((_, si) => flat.findIndex((c) => c.si === si));
const sceneStart = firstCue.map((ci, si) => (si === 0 ? 0 : Math.max(cues[ci - 1][1] + 0.05, cues[ci][0] - 0.55)));
const duration = Math.ceil((Math.max(voiceDur, cues[cues.length - 1][1]) + TAIL) * 10) / 10;
const scenes = sceneStart.map((s, si) => [+s.toFixed(2), +(si + 1 < sceneStart.length ? sceneStart[si + 1] : duration).toFixed(2)]);

// Subtitle chunks: long sentences are split at a comma, dash or semicolon
// near the middle, with time shared by letter count.
const MAXL = LANG === "en" ? 84 : 66; // English: ~14 words per subtitle line
function split(text) {
  const L = letters(text);
  if (L <= MAXL) return [text];
  // candidate breaks: after punctuation (preferred) or at any space; each part keeps ≥ 30% of the letters
  const cand = [...text.matchAll(/[,;—]\s*|\s+/g)].map((m) => ({ p: m.index + m[0].length, punct: /[,;—]/.test(m[0]) }))
    .filter(({ p }) => { const a = letters(text.slice(0, p)); return a >= L * 0.3 && a <= L * 0.7; });
  if (!cand.length) return [text];
  const score = ({ p, punct }) => Math.abs(letters(text.slice(0, p)) - L / 2) / L - (punct ? 0.15 : 0);
  const best = cand.reduce((a, b) => (score(b) < score(a) ? b : a)).p;
  return [...split(text.slice(0, best).trim()), ...split(text.slice(best).trim())];
}
const subs = [];
cues.forEach(([a, b], i) => {
  const parts = split(flat[i].text), total = parts.reduce((n, p) => n + letters(p), 0);
  let t = a;
  parts.forEach((p) => { const d = ((b - a) * letters(p)) / total; subs.push([t, t + d, p, i]); t += d; });
});
const subsOut = subs.map(([a, b, text, ci], k) => {
  const next = subs[k + 1]?.[0] ?? duration;
  const sameCueNext = subs[k + 1]?.[3] === ci;
  const e = sameCueNext ? b : Math.min(b + 0.35, next - 0.08);
  const lead = k && subs[k - 1][3] === ci ? 0 : 0.05;
  return [+Math.max(0, a - lead).toFixed(2), +e.toFixed(2), text, ci];
});

const out = { source: voice ? "voice" : "estimate", duration, scenes, cues: cues.map(([a, b]) => [+a.toFixed(2), +b.toFixed(2)]), subs: subsOut };
writeFileSync(join(ROOT, `src/timing.${LANG}.js`), `// Generated by tools/timing.mjs (${voice ? "measured from " + voice.split("/").pop() : "estimated from text length"}). Do not edit by hand.\nwindow.TIMING = ${JSON.stringify(out)};\n`);
report.push(`duration ${duration}s; scenes: ${S.scenes.map((sc, i) => `${sc.id} ${scenes[i][0].toFixed(1)}–${scenes[i][1].toFixed(1)}`).join(", ")}`);
report.push(`wrote src/timing.${LANG}.js (${out.cues.length} cues, ${subsOut.length} subtitle chunks)`);
console.log(report.join("\n"));
