// Renders src/index.html frame by frame with headless Chromium and pipes the
// frames into ffmpeg.
//
//   node tools/render.mjs --format 16x9                 # full video -> output/
//   node tools/render.mjs --format 9x16
//   node tools/render.mjs --format 16x9 --stills 5,15,40  # PNG stills for review
//
// Options: --fps 30  --audio output/soundtrack.wav  --out <file.mp4>
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { readFileSync } from "node:fs";

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require("playwright");
} catch {
  // Fall back to a globally installed copy (npm i -g playwright).
  const { execSync } = await import("node:child_process");
  const root = execSync("npm root -g").toString().trim();
  playwright = require(join(root, "playwright"));
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]?.startsWith("--") ? true : all[i + 1] ?? true]] : acc), []),
);
const format = args.format ?? "16x9";
const [W, H] = format === "9x16" ? [1080, 1920] : [1920, 1080];
const ctx = {};
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
const SCRIPT = ctx.SCRIPT;
const fps = Number(args.fps ?? SCRIPT.fps);
const outDir = join(ROOT, "output");
mkdirSync(outDir, { recursive: true });

const launchOpts = {};
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
const browser = await playwright.chromium.launch(launchOpts);
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const url = pathToFileURL(join(ROOT, "src/index.html")).href + `?format=${format}`;
await page.goto(url);
await page.evaluate(() => window.ready);
const clip = { x: 0, y: 0, width: W, height: H };

if (args.stills) {
  const dir = join(outDir, "stills");
  mkdirSync(dir, { recursive: true });
  for (const t of String(args.stills).split(",").map(Number)) {
    await page.evaluate((tt) => window.renderAt(tt), t);
    const file = join(dir, `${format}-t${String(t).padStart(5, "0")}.png`);
    await page.screenshot({ path: file, clip });
    console.log(file);
  }
  await browser.close();
  process.exit(0);
}

const out = args.out ?? join(outDir, `sonicium-entropy-bn-${format}.mp4`);
const audio = args.audio === undefined ? join(outDir, "soundtrack.wav") : args.audio;
const total = Math.round(SCRIPT.duration * fps);
const ff = spawn(
  "ffmpeg",
  [
    "-y", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    ...(audio && audio !== "none" ? ["-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest"] : []),
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    "-metadata", "title=Sonicium Entropy — ডেটা সেন্টারের জন্য কোয়ান্টাম র‍্যান্ডমনেস",
    "-metadata:s:a:0", "language=ben",
    out,
  ],
  { stdio: ["pipe", "inherit", "inherit"] },
);
const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));

const t0 = Date.now();
for (let f = 0; f < total; f++) {
  await page.evaluate((tt) => window.renderAt(tt), f / fps);
  const buf = await page.screenshot({ type: "jpeg", quality: 95, clip });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (f % 150 === 0) console.log(`${format}: frame ${f}/${total} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await done;
await browser.close();
console.log("wrote", out);
