# Sonicium Quantum Lab and Sonicium Entropy: storyboard

**Runtime:** exactly 5:00 (300 s) · 1920×1080 · 30 fps · Bengali
**Audience:** Government of Bangladesh: the Ministry of Posts, Telecommunications and Information Technology, plus the relevant ICT, cybersecurity, research and digital-infrastructure authorities
**Central message:** Sonicium Quantum Lab and Sonicium Entropy are an opportunity to investigate, validate and potentially commercialize locally developed quantum-related technology for Bangladesh's digital infrastructure.

Scene bounds follow the brief exactly. Narration lines are in `src/script.js`, and cue times are in `src/timing.js`. The cue times are currently estimated from narration length, and are re-measured from the recorded voice-over with `tools/timing.mjs --voice`.

Every scene shows one of these labels in the top-right corner:

| Label on screen | Meaning |
|---|---|
| ✓ যাচাইকৃত: Sonicium Entropy প্রোডাক্ট ডকুমেন্টেশন | Checked against the Sonicium Entropy repository |
| প্রকৃত পরীক্ষার ফল · সীমাবদ্ধতাসহ | A real, published test result, shown with its stated limits |
| ধারণাগত / প্রতীকী চিত্র | Generated diagram or symbolic visual. No real footage is used. |
| প্রস্তাবিত · অনুমোদিত কার্যক্রম নয় | A proposal for consideration, not an approved activity |

| # | Time | Label | Visuals | On-screen text (Bengali) |
|---|---|---|---|---|
| 1 | 00:00–00:25 | illustrative | World map (Natural Earth). Bangladesh is filled in national green, Dhaka pulses in red, and arcs draw out to global digital hubs while the view slowly zooms toward South Asia. Cards introduce the Lab (with its official SQL logo) and the Sonicium Entropy wordmark. | বাংলাদেশের নিজস্ব প্রযুক্তি উদ্ভাবনের নতুন সম্ভাবনা · ডিজিটাল সেবা / আর্থিক লেনদেন / ক্লাউড অবকাঠামো |
| 2 | 00:25–01:00 | illustrative | Faint quantum-circuit background. The Lab's identity card, a diagram linking the Lab with universities, industry and government, and three research-area cards with status labels. Quantum computing and QML are labelled "গবেষণা পর‍্যায়"; quantum randomness is labelled "API সেবা · Sonicium Entropy". | পরিচিতি: Sonicium Quantum Lab · একটি স্ট্যাটাস লেবেল জানায় যে "গবেষণা পর‍্যায়" কোনো বাণিজ্যিক প্রস্তুতির দাবি নয় |
| 3 | 01:00–01:40 | verified → result | Flow chips: random data → authenticated API → software, with the hex/base64/binary formats. A simplified processor die that switches from Q63 (63 dots) to Q135 (135 dots), labelled as a simplified drawing and not hardware. A single-qubit `|0⟩ → H → measure` animation with a live 0/1 histogram and bit stream. A four-step ladder: raw data → statistical tests → entropy estimation (SP 800-90B) → cryptographic output (SP 800-90A DRBG). Last, the actual test-result card. | 15/15 NIST SP 800-22 · 12,99,69,408 বিট · DRBG মান দেখায় / উৎসের এনট্রপি প্রমাণ করে না / সার্টিফিকেশন নয় |
| 4 | 01:40–02:30 | verified | Architecture: কোয়ান্টাম উৎস → পরিমাপ → যাচাই ও প্রক্রিয়াকরণ → প্রমাণীকৃত API → ডেটা-সেন্টার অ্যাপ্লিকেশন, with a moving data packet. Seven steps light up in sync with the narration. The request card uses the real endpoint with `YOUR_API_KEY`, followed by a shortened sample response and an HTTP 503 note. | ১–৭ ধাপ (revised to match the implementation: the API serves DRBG output seeded from the pool, not raw bits) |
| 5 | 02:30–03:15 | illustrative | Four sector tiles (data centers, government digital services, fintech, cloud) and five use cases, the last marked as future research. Then a ≠ comparison of quantum randomness with post-quantum cryptography, three strategic values, and a reality note. | "একটি অন্যটির বিকল্প নয়" · "সম্পূর্ণ প্রযুক্তিগত স্বনির্ভরতার দাবি করা হচ্ছে না" |
| 6 | 03:15–04:00 | illustrative | Six opportunity cards, each tagged "সম্ভাব্য", and a strip of conditions they depend on. | নির্ভর করে: যাচাই · বাজার-চাহিদা · কমপ্লায়েন্স · বাণিজ্যিক বাস্তবায়ন · স্বাধীন মূল্যায়ন · no figures shown |
| 7 | 04:00–04:35 | proposal | A four-phase roadmap whose progress line fills as each phase is narrated. A stakeholder diagram (government technology body, universities, industry and data centers, the Lab) around a technical pilot, plus collaboration areas. | ধাপ ১–৪ · "সরকারি অনুমোদিত কোনো কার্যক্রম নয়" |
| 8 | 04:35–05:00 | brand | Bangladesh outline (Natural Earth) with a Dhaka pulse. Closing title and final message, both logos, both websites, and an invitation. The music resolves softly. | গবেষণা থেকে প্রয়োগ—বাংলাদেশের প্রযুক্তিগত সক্ষমতার পথে |

The full narration with timings is in `narration-bn.txt` (text only, ready to paste into a TTS tool) and in `output/sonicium-bangladesh-briefing-bn.srt`.

## Verification log

Sources: `hussainbillah/Sonicium-Entropy` (commit `4054f3b`) and `hussainbillah/sonicium-quantum-lab-ltd` (commit `3acdbd4`).

| Statement in the video | Source |
|---|---|
| Endpoint `GET https://api.soniciumentropy.com/v1/random`, `length`, `format` = hex / base64 / binary | `packages/sdk/src/transport.ts`, `apps/api/src/api-gateway/schemas.ts`, `random.controller.ts` |
| Bearer API-key authentication | `packages/sdk/src/transport.ts` |
| Response fields `data`, `length`, `format`, `register`, `drbgAlgorithm`, `healthCheck{rct,apt}` (subset shown) | `random.controller.ts` (`RandomResponse`) |
| Q63 = 63 qubits and Q135 = 135 qubits, on superconducting processors reached through the cloud | `entropySource = superconducting_qubit_q${qubits}`; `docs/research/manuscript/sections-6-9-draft.md` §6.1 (IBM Heron processors through IBM Quantum Runtime). IBM is not named on screen, to avoid implying a partnership. |
| A Hadamard gate on every qubit, then measurement | manuscript §6.1 (production circuit) |
| Extraction, SP 800-90B RCT/APT health tests, failed channels excluded, per-register pools | `services/extractor-engine`, `random.controller.ts` (`describeHealth`), manuscript §6.1 |
| The API serves SP 800-90A DRBG output (CTR-DRBG-AES-256) seeded from the pool | SDK READMEs, `RandomResponse.drbgAlgorithm` |
| An empty pool returns 503, with no non-quantum fallback | SDK READMEs (`PoolEmptyError`) |
| 15/15 SP 800-22 tests passed on 129,969,408 bits of served Q135 output; this validates the DRBG, says nothing about the source, and is not a certification | `docs/research/q135-nist-sts-2026-10-02.md` (summary and §7) |
| The platform also offers ML-KEM / ML-DSA keypairs | `packages/sdk/README.md`. The video only names them as PQC examples and makes no product claim about them. |
| Research areas: quantum computing, QML, quantum randomness | soniciumquantumlab.com source (`sonicium-quantum-lab-ltd`) |
| Logo (SQL) | `sonicium-quantum-lab-ltd/public/og-image.png`, the highest-resolution copy of the site logo `src/assets/logo.png` (cropped) |

**Deliberately not used** (from the Lab website's marketing copy, unverified): "Bangladesh's first quantum computing company/platform", hardware ownership claims, and any partnership, award, certification or deployment claims. **Not stated anywhere:** revenue, market share, job numbers, savings, investment returns, government approval, or 100% security. `tools/check.mjs` scans for these phrases.
