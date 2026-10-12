// Writes sonicium_entropy_casino_storyboard.md (scene times for both
// languages, on-screen content, narration) and the plain-text voice-over
// scripts output/voiceover-script-<lang>.txt, from src/script.js and
// src/timing.<lang>.js. Re-run after tools/timing.mjs.
//
//   node tools/make_storyboard.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ctx = { globalThis: {} };
ctx.globalThis = ctx;
vm.runInNewContext(readFileSync(join(ROOT, "src/script.js"), "utf8"), ctx);
const S = ctx.SCRIPT;
const T = {};
for (const lang of S.langs) {
  const c = {};
  vm.runInNewContext(readFileSync(join(ROOT, `src/timing.${lang}.js`), "utf8").replace("window.TIMING", "globalThis.TIMING"), Object.assign(c, { globalThis: c }));
  T[lang] = c.TIMING;
}
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

const TITLES = {
  intro: "Introduction",
  understand: "Understanding Sonicium Entropy",
  usage: "How a casino platform can use the API",
  api: "API key integration: step by step",
  value: "How much business value?",
  roi: "ROI calculator — illustrative scenario",
  stages: "Staged path: proof of concept → pilot → commercial",
  next: "Next steps and closing",
};
const VISUALS = {
  intro: "Title SONICIUM ENTROPY with the subtitle \"Quantum Randomness API Integration for Casino Platforms\" and the SQL logo card. Right: conceptual infrastructure diagram — players → casino platform (game services, accounts, payments) → approved backend service (holds the API key, server-side) → Sonicium Entropy API (GET /v1/random), with packets moving along the links. Chips: verify → connect → test → assess value. Badge: Conceptual illustration.",
  understand: "Four pipeline cards: quantum measurement (superconducting QPUs, Q63 / Q135 registers) → health-tested (NIST SP 800-90B, RCT / APT) → seeds a standards-based DRBG (NIST SP 800-90A, CTR-DRBG-AES-256) → one documented endpoint (GET /v1/random). Provenance card with sample response fields (register, drbgAlgorithm, entropySource, healthCheck). Question card: where does it fit, what measurable value does it add? Badge: Verified against source & docs.",
  usage: "Flow: casino application → approved backend service → Sonicium Entropy API → randomness response → validated application workflow, with a moving packet. Component grid (game engine, account system, transactions, monitoring tools) with one highlighted evaluation point (controlled test service) and the use cases. \"Measured by the test application\" chips: latency, throughput, availability, error handling, format compatibility, cost. Compliance banner: live wagering must follow the approved outcome-generation design, regulations and independent lab requirements — shown as a technical evaluation, not as an approved game RNG.",
  api: "Six numbered steps highlighted in turn (obtain access → receive key sk_… → store server-side → authenticated request → response hex/base64/binary → errors & usage). Code cards: backend config with SONICIUM_API_KEY=\"YOUR_SONICIUM_API_KEY\" (fictional placeholder), the verified curl request with Authorization: Bearer $SONICIUM_API_KEY, a sanitized sample response; then an error table (401, 429 rate, 429 quota, 503, 502, 413, timeout) with client actions. Usage-monitoring card: per-key limits, signed CSV usage export, plan limits 60 / 300 / 1,000 / 6,000 per minute.",
  value: "Four value areas (less integration effort, research & testing capability, simple access, differentiated roadmap). Comparison table — engineering hours, integration cost, cost per million requests, latency p50/p95, error rate, operating cost — every cell a \"measure\" / \"measure in pilot\" placeholder, no invented numbers. Banner: Not a revenue lever — quantum randomness does not increase revenue or change the house edge. Formula: measurable infrastructure value + suitable applications + viable service agreement. Badge: Metrics to be measured by the client.",
  roi: "Banner: ILLUSTRATIVE SCENARIO — NOT A CUSTOMER FORECAST OR GUARANTEED RETURN. Sample inputs (10,000,000 requests/month, $500 fee, $2,000 integration, $100/month operations, $1,000/month client-verified benefit). Output tiles count up: $600 monthly, $9,200 first-year cost, 120M requests, $76.67 per million, $12,000 benefit, $2,800 net, 30.4% ROI. Chart: cumulative cost vs cumulative benefit over 12 months, break-even ≈ month 5. Method note: sample assumptions, not Sonicium Entropy prices; 10M/month exceeds the Business plan's 2M quota, so an Enterprise agreement would apply.",
  stages: "Progress bar and three stage cards — Stage 1 technical proof of concept (connectivity, authentication, response formats, baseline performance); Stage 2 controlled pilot (real workload performance, reliability, operating cost, compatibility); Stage 3 commercial evaluation (pricing, service limits, support, production requirements). Scale note: throughput, concurrency, service levels, data handling, incident response, required validation.",
  next: "Four next steps (define the use case, review the API documentation, agree a test workload, set performance & commercial metrics) and an invitation card; then the closing: SONICIUM ENTROPY megatitle, tagline \"Quantum randomness · API-driven integration · A new opportunity for technology collaboration\", SQL logo, soniciumentropy.com and soniciumquantumlab.com.",
};
const BASIS = { illustrative: "Conceptual illustration", verified: "Verified against Sonicium Entropy source & docs", tobemeasured: "Metrics to be measured by the client", scenario: "Illustrative scenario — not a forecast", brand: "Brand" };

const L = [];
L.push("# Sonicium Entropy × Casino Platform — Storyboard", "");
L.push("Generated by `tools/make_storyboard.mjs` from `src/script.js` and `src/timing.<lang>.js`. Times are the current timing for each language version (" +
  S.langs.map((l) => `${l.toUpperCase()}: ${T[l].source}, ${mmss(T[l].duration)}`).join("; ") +
  "). When a voice-over is supplied, `tools/timing.mjs --voice` re-derives them; re-run this script afterwards.", "");
L.push("Format: 1920 × 1080, 30 fps, H.264 + AAC. Two language versions, identical visuals, captions burned in per language.", "");
L.push("| # | Scene | EN | BN | On-screen basis |", "|---|---|---|---|---|");
S.scenes.forEach((sc, i) => {
  const [ea, eb] = T.en.scenes[i], [ba, bb] = T.bn.scenes[i];
  L.push(`| ${i + 1} | ${TITLES[sc.id]} | ${mmss(ea)}–${mmss(eb)} | ${mmss(ba)}–${mmss(bb)} | ${BASIS[sc.basis] ?? sc.basis} |`);
});
L.push("");
let cue = 0;
S.scenes.forEach((sc, i) => {
  L.push(`## ${i + 1}. ${TITLES[sc.id]}`, "");
  L.push(`**Visuals.** ${VISUALS[sc.id]}`, "");
  L.push("| Cue | EN time | English narration | BN time | Bengali narration |", "|---|---|---|---|---|");
  sc.cues.en.forEach((en, k) => {
    const e = T.en.cues[cue + k], b = T.bn.cues[cue + k];
    L.push(`| ${cue + k + 1} | ${mmss(e[0])} | ${en} | ${mmss(b[0])} | ${sc.cues.bn[k]} |`);
  });
  cue += sc.cues.en.length;
  L.push("");
});
L.push("## Content rules applied", "");
L.push("- No real API key anywhere: the visible key is the fictional placeholder `YOUR_SONICIUM_API_KEY`, and requests read it from the `SONICIUM_API_KEY` environment variable.");
L.push("- API endpoint, parameters, response fields, error codes and plan limits are taken from the Sonicium Entropy implementation; see `sonicium_entropy_api_demo.md`.");
L.push("- No claim that the service increases winnings or revenue, changes the house edge, guarantees profit or proves fairness. Live-wagering use is presented as subject to the approved game design, regulation and independent testing.");
L.push("- The ROI scene is labelled *ILLUSTRATIVE SCENARIO — NOT A CUSTOMER FORECAST OR GUARANTEED RETURN*; its numbers are recomputed from `sonicium_entropy_roi_calculator.json` by `tools/build_data.mjs`.");
L.push("- `tools/check.mjs` fails the build on key-shaped strings, literal bearer tokens and unsupported claims.");
writeFileSync(join(ROOT, "sonicium_entropy_casino_storyboard.md"), L.join("\n") + "\n");

mkdirSync(join(ROOT, "output"), { recursive: true });
for (const lang of S.langs) {
  const txt = S.scenes.map((sc) => sc.cues[lang].join("\n")).join("\n\n");
  writeFileSync(join(ROOT, `output/voiceover-script-${lang}.txt`), txt + "\n");
}
console.log("wrote sonicium_entropy_casino_storyboard.md and output/voiceover-script-{" + S.langs.join(",") + "}.txt");
