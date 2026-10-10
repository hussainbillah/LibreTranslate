// Sonicium Entropy — integration demo for Node 20+ using the official SDK
// (packages/sdk in the Sonicium Entropy repository, published as @sonicium/sdk).
//
//   npm install @sonicium/sdk
//   SONICIUM_API_KEY=... node sonicium_demo.mjs
//
// The SDK sends `Authorization: Bearer <key>`, applies a 30 s per-attempt
// timeout, retries 429-with-Retry-After / 502 / 503 / network failures, and
// raises typed errors (AuthenticationError, QuotaExceededError, PoolEmptyError …).
import { Sonicium } from "@sonicium/sdk";

const apiKey = process.env.SONICIUM_API_KEY;
if (!apiKey || apiKey === "YOUR_API_KEY") {
  console.error("Set SONICIUM_API_KEY from your secret manager (the placeholder is not a key).");
  process.exit(2);
}

const sonicium = new Sonicium({ apiKey, baseUrl: process.env.SONICIUM_BASE_URL });
const draw = await sonicium.random({ length: 32, format: "hex" });

if (draw.bytes.length !== 32) throw new Error("unexpected length");
if (draw.healthCheck.rct !== "passed" || draw.healthCheck.apt !== "passed") {
  throw new Error(`health check not passed: ${JSON.stringify(draw.healthCheck)}`);
}

// Log provenance only — never the key and never the random bytes.
console.log({
  register: draw.register,
  drbgAlgorithm: draw.drbgAlgorithm,
  entropySource: draw.entropySource,
  healthCheck: draw.healthCheck,
  servedAt: draw.servedAt,
});
