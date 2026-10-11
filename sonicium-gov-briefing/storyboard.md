# Sonicium Quantum Lab and Sonicium Entropy: storyboard

**Runtime:** 6:54 (414.4 s): the ElevenLabs voice-over (409.9 s) plus a 4.5 s musical tail · 1920×1080 · 30 fps · Bengali
**Audience:** Government of Bangladesh: the Ministry of Posts, Telecommunications and Information Technology, plus the relevant ICT, cybersecurity, research and digital-infrastructure authorities
**Narration:** `voiceover-script-bn.txt`, recorded as `output/voiceover.mp3`. Each of its 56 sentences is a cue. `tools/timing.mjs --voice` measured every cue's start and end from the pauses in the recording; every sentence boundary falls on a pause of about 0.35–0.5 s. Scene bounds follow the narration.

Every scene shows one of these labels in the top-right corner:

| Label on screen | Meaning |
|---|---|
| ✓ যাচাইকৃত: Sonicium Entropy প্রোডাক্ট ডকুমেন্টেশন | Checked against the Sonicium Entropy repository |
| প্রকৃত পরীক্ষার ফল · সীমাবদ্ধতাসহ | A real, published test result, shown with its stated limits |
| ধারণাগত / প্রতীকী চিত্র | Generated diagram or symbolic visual. No real footage is used. |
| প্রস্তাবিত · অনুমোদিত কার্যক্রম নয় | A proposal for consideration, not an approved activity |

| # | Time | Label | Narration (sentences) | Visuals, each anchored to the line that is spoken |
|---|---|---|---|---|
| 1 | 0:00–0:47 | illustrative | Title and names; Bangladesh's digital transformation; the Lab and Entropy; the goal (7) | Natural Earth world map with Bangladesh in green, a Dhaka pulse, arcs to global hubs and a slow zoom. Title "বাংলাদেশের কৌশলগত প্রযুক্তির নতুন সম্ভাবনা". Four sector chips, then the Lab card (SQL logo), the Entropy card and a strip of goals. |
| 2 | 0:47–1:32 | illustrative | The Lab and its research areas; capability; collaboration; Entropy as a special field (5) | Lab identity card. Four research areas, each labelled "গবেষণা পর্যায়" except quantum randomness, which is labelled "API সেবা" and highlighted. A "বোঝা → পরীক্ষা → বিকাশ" chain, and a collaboration diagram linking universities, research institutes, industry and government bodies. |
| 3 | 1:32–1:56 | illustrative | Why quantum randomness matters (4) | Use chips: keys, session tokens, nonces, security operations. Hex grids comparing unpredictable values with a predictable repeating pattern whose next value is revealed. |
| 4 | 1:56–2:36 | verified → result | Quantum measurement as a source; the API service; source data, statistical tests and entropy are different things; validation needs (5) | Simplified processor die (Q63 → Q135), labelled as not hardware. `|0⟩ → H → measure` with a live histogram. Flow chips for the formats. A four-step ladder walked through in sync with the distinction sentence. Then the actual test-result card: SP 800-22 15/15 on 12,99,69,408 bits, plus its limits. |
| 5 | 2:36–3:39 | verified | How it works: step 1 source/measurement, step 2 health tests, step 3 API request and key, delivery, use, architecture purpose, real security (10) | Architecture flow with a moving packet. Seven rows numbered ১ ১ ২ ২ ৩ ৩ ৪, matching the narration's steps, each highlighted as it is spoken. The real request card with `YOUR_API_KEY`, a sample response, the 503 note, and "প্রকৃত নিরাপত্তা নির্ভর করে …". |
| 6 | 3:39–4:28 | illustrative | Strategic importance; sectors; complementary source; quantum randomness ≠ PQC; the framework (7) | Four sector tiles (government digital services, fintech, cloud, enterprise software) and use cases. Then the ≠ comparison, with the PQC column highlighted while it is defined, and the "একা … পোস্ট-কোয়ান্টাম নিরাপদ করে না" note. A framework row: randomness source + algorithms (including PQC) + KMS/HSM + secure implementation. Cloud-hardware reality note. |
| 7 | 4:28–5:17 | illustrative | Economic potential; the opportunity list; youth; conditions; evidence-based decision (5) | Cards tagged "সম্ভাব্য" (API and licensing, software export, specialist jobs, joint research, a wide youth card). A "যাচাই করতে হবে" strip listing the six conditions from the narration. "প্রমাণভিত্তিক সিদ্ধান্ত", with a note that no figures are shown. |
| 8 | 5:17–6:01 | proposal | Collaboration; phases 1–3; the expansion decision (5) | Stakeholder diagram (ministries and technology authorities, research institutes and universities, industry, the Lab). A four-phase roadmap that fills as each phase is spoken. Collaboration areas marked "অনুমোদিত কার্যক্রম নয়". |
| 9 | 6:01–6:54 | brand | Foundations; the initiative; closing title; final message; names; tagline (8) | Bangladesh outline with a Dhaka pulse. Foundation pillars (research · innovation · responsible collaboration; validation · skilled workforce · international standards), then the closing title, the final message, the SQL logo and Entropy wordmark as each name is spoken, the tagline and both websites. Subtitles are hidden for lines already shown large on screen. |

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
