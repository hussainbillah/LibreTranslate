# Sonicium Entropy: Bengali explainer storyboard

**Runtime:** 88 s · **Masters:** 1920×1080 (16:9) and 1080×1920 (9:16) · 30 fps
**Source of truth for timing and text:** `src/script.js`. The burned-in subtitles, the `.srt` file and this table all come from it.

Basis tags (shown in the top-right corner of every scene):

- **যাচাইকৃত (verified):** every technical statement in the scene was checked against the Sonicium Entropy repository (see *Verification log* below).
- **ধারণাগত চিত্র (illustrative):** a conceptual diagram. It makes no product claim beyond "Sonicium Entropy supplies random data".

| # | Time | Basis | Visuals | Narration / subtitles (Bengali) |
|---|------|-------|---------|----------------------------------|
| 1 | 0:00–0:10 | illustrative | Four light server racks with blinking status LEDs, a network graph with encrypted packets moving between nodes. Layer chips appear: ক্রিপ্টোগ্রাফি · অ্যাক্সেস কন্ট্রোল · কী ম্যানেজমেন্ট · নিরাপদ বাস্তবায়ন | আধুনিক ডেটা সেন্টারে প্রতি মুহূর্তে অসংখ্য এনক্রিপ্টেড সংযোগ চলে। / এই নিরাপত্তা নির্ভর করে ক্রিপ্টোগ্রাফি, অ্যাক্সেস কন্ট্রোল, কী ম্যানেজমেন্ট ও নিরাপদ বাস্তবায়নের ওপর। |
| 2 | 0:10–0:21 | illustrative | Use chips (কী, সেশন টোকেন, ননস, চ্যালেঞ্জ). Two hex grids: a repeating 4-byte pattern whose next value is predictable, and a non-repeating stream. Footnote: the hex values are made up for the visual. | ক্রিপ্টোগ্রাফিক কী, সেশন টোকেন, ননস ও চ্যালেঞ্জ — সবকিছুর ভিত্তি অনুমান-অযোগ্য র‍্যান্ডম মান। / র‍্যান্ডমনেস দুর্বল বা অনুমানযোগ্য হলে, শক্তিশালী অ্যালগরিদমও ঝুঁকিতে পড়তে পারে। |
| 3 | 0:21–0:32 | verified | Pipeline: quantum register (Q63 · 63 qubits / Q135 · 135 qubits, superconducting) → health tests and extraction (SP 800-90B RCT/APT) → per-register entropy pool → DRBG (SP 800-90A, CTR-DRBG-AES-256) → authenticated API (GET /v1/random). Three fact cards: register fixed per key; provenance in every response; an empty pool returns 503, with no non-quantum fallback. | Sonicium Entropy একটি কোয়ান্টাম-র‍্যান্ডমনেস API — প্রমাণীকৃত অনুরোধের মাধ্যমে সফটওয়্যারে র‍্যান্ডম ডেটা সরবরাহ করে। / কোয়ান্টাম হার্ডওয়্যারের এনট্রপি দিয়ে NIST SP 800-90A DRBG সিড করা হয়; প্রতিটি API কী-তে Q63 অথবা Q135 রেজিস্টার নির্দিষ্ট থাকে। |
| 4 | 0:32–0:50 | verified | Four-step list highlights in turn. The terminal types `export SONICIUM_API_KEY="YOUR_API_KEY"` and a `curl` call to `https://api.soniciumentropy.com/v1/random?length=32&format=hex` with `Authorization: Bearer $SONICIUM_API_KEY`. Badge: key verified, 401 if invalid. A JSON response with every documented field appears, labelled as a sample. Then validation code runs (format, length, decode, rct/apt). | ১. অনুমোদিত অ্যাপ্লিকেশন HTTPS-এর মাধ্যমে /v1/random এন্ডপয়েন্টে অনুরোধ পাঠায়। / ২. API, Authorization হেডারের Bearer API কী যাচাই করে। / ৩. সার্ভিস hex বা base64 ফরম্যাটে র‍্যান্ডম ডেটা ও তার উৎস-তথ্য ফেরত দেয়। / ৪. অ্যাপ্লিকেশন দৈর্ঘ্য, ফরম্যাট ও হেলথ-চেক যাচাই করে তবেই ডেটা ব্যবহার করে। |
| 5 | 0:50–1:01 | illustrative | Five use-case cards: key generation (when it fits the organisation's KMS/HSM architecture), session tokens and nonces, challenge-response, randomized security testing and simulation, cloud and enterprise apps. A scope bar states what the product does **not** do. | সম্ভাব্য ব্যবহার: কী জেনারেশন, সেশন টোকেন ও ননস, চ্যালেঞ্জ-রেসপন্স এবং নিয়ন্ত্রিত সিকিউরিটি টেস্টিং। / মনে রাখুন: Sonicium Entropy র‍্যান্ডম ডেটা সরবরাহ করে — এটি পুরো ডেটা সেন্টার এনক্রিপ্ট করে না, ফায়ারওয়াল, HSM বা KMS-এর বিকল্পও নয়। |
| 6 | 1:01–1:10 | illustrative | Six-layer security stack. The randomness-source layer (Sonicium Entropy) is highlighted as one layer among firewall, IAM, KMS/HSM, crypto implementation and monitoring. A dependency checklist, then the caveat "কোনো একক উপাদান সম্পূর্ণ নিরাপত্তার নিশ্চয়তা দেয় না।" | সঠিক উৎসের র‍্যান্ডমনেস ক্রিপ্টোগ্রাফিক ওয়ার্কফ্লোর র‍্যান্ডমনেস-অংশকে শক্তিশালী করতে পারে। / তবে সামগ্রিক ঝুঁকি কমানো নির্ভর করে ইন্টিগ্রেশন, এনট্রপি যাচাই, কী সুরক্ষা, অ্যাক্সেস কন্ট্রোল ও অপারেশনাল নিরাপত্তার ওপর। |
| 7 | 1:10–1:20 | verified | Flow: Data-center app → secure API client → authenticated Sonicium Entropy API → random-data response → app-specific crypto workflow, with a packet travelling along it. Eight guardrail cards: HTTPS/TLS, key in env/secret manager, least privilege, timeout, 429 + Retry-After, safe retry (GET or Idempotency-Key), response validation, audit log without secrets. An example audit-log line shows the key masked (`sk_••••••`) and no random data. | এন্টারপ্রাইজ ইন্টিগ্রেশনে: TLS, সিক্রেট ম্যানেজারে API কী, ন্যূনতম-অধিকার নীতি ও নির্দিষ্ট টাইমআউট। / রেট-লিমিটে Retry-After মেনে নিরাপদ রিট্রাই, রেসপন্স যাচাই, আর গোপন তথ্যহীন অডিট লগ। |
| 8 | 1:20–1:28 | brand | Wordmark, tagline, CTA, URL pill `soniciumentropy.com`, "Sonicium Quantum Lab Ltd." A soft chime plays. | ডেটা সেন্টার ও ক্লাউড প্রোভাইডারদের জন্য — ইন্টিগ্রেশন ও পাইলট সম্ভাবনা জানতে ভিজিট করুন soniciumentropy.com |

## Verification log

Each verified statement, with the file in `hussainbillah/Sonicium-Entropy` (commit `4054f3b`) that supports it:

| On-screen statement | Source |
|---|---|
| Base URL `https://api.soniciumentropy.com` | `packages/sdk/src/transport.ts` (`DEFAULT_BASE_URL`) |
| `GET /v1/random`, query `length` (1–per-key limit, default 32) and `format` (`hex`/`base64`/`binary`) | `apps/api/src/api-gateway/random.controller.ts`, `schemas.ts` (`randomQuerySchema`) |
| `Authorization: Bearer <key>`, keys `sk_…` / `sk_dev_…` | `packages/sdk/src/transport.ts`, `client.ts` |
| JSON fields `data, length, format, register, drbgAlgorithm, entropySource, healthCheck{rct,apt,excludedChannels}, seedEpoch, seedId, sourceJobIds, servedAt` | `random.controller.ts` (`RandomResponse`) |
| Register is Q63 or Q135 and fixed per key | `packages/sdk/README.md`, `sdks/python/README.md` |
| Q63 = 63-qubit, Q135 = 135-qubit superconducting register | `entropySource` = `superconducting_qubit_q${qubits}` in `random.controller.ts`; `docs/research/manuscript/sections-6-9-draft.md` §6.1 |
| NIST SP 800-90A DRBG seeded only from quantum hardware; `CTR-DRBG-AES-256` default | SDK READMEs; `RandomResponse.drbgAlgorithm` doc comment |
| SP 800-90B §4.4 health tests reported as RCT / APT | `RandomResponse.healthCheck` doc comment |
| Pool empty → 503, no non-quantum substitute | SDK READMEs (`PoolEmptyError`), `POOL_EMPTY_RETRY_AFTER_SECONDS` |
| 401 bad key · 429 rate-limit (Retry-After) / quota · 413 · 502 · 503 | `packages/sdk/README.md` error table |
| 30 s per-attempt timeout, retries honour Retry-After, POSTs carry Idempotency-Key | `packages/sdk/src/client.ts`, `transport.ts` |

**Not claimed anywhere in the video:** performance or throughput figures, certifications, regulatory approvals, customers, partners, testimonials, entropy guarantees, or "100% / unhackable / risk-free" language. `tools/check.mjs` scans for the last group.

**Sample values:** the `data` hex, `seedEpoch`, `seedId` and `servedAt` in scene 4 are examples, and the card header says so. The hex grids in scene 2 are generated for the visual.
