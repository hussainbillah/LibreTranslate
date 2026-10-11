# Sonicium Entropy: investor film storyboard

**Format:** 1920×1080 · 30 fps · Bengali narration with English technical labels
**Narration:** `voiceover-script-bn.txt` (44 sentences). Its length sets the film's length.
**Current timing:** *estimated* at the pace of the last ElevenLabs recording (0.0753 s per letter), which gives **5:45**. Once the recorded voice-over arrives, `tools/timing.mjs --voice` re-measures every cue, and the scene bounds below move with it.

**About the 7–9 minute target.** The supplied script runs about 5¾ minutes at that pace. That clears the 5-minute minimum but falls short of the target. Reaching about 8 minutes would mean extending the script by roughly 40%. Natural places to extend are segment-by-segment customer detail, the competitive landscape, and the roadmap milestones. Every visual is anchored to a cue, so new sentences only need matching `data-in` anchors.

The labels in the top-right corner of every scene:

| Label | Meaning |
|---|---|
| তৃতীয় পক্ষের বাজার গবেষণা · উৎসসহ | Third-party forecast, source on screen |
| ✓ যাচাইকৃত: Sonicium Entropy সোর্স কোড ও ডকুমেন্টেশন | Verified product fact |
| ক্যাটালগ মূল্য যাচাইকৃত · গ্রাহক খাত সম্ভাব্য | Real list prices; customer segments are potential |
| প্রকাশ্য তথ্য + নিজস্ব কৌশলগত বিশ্লেষণ | Public vendor data plus our own positioning analysis |
| দৃশ্যপট · কোম্পানির আয়ের পূর্বাভাস নয় | Illustration or assumption, not revenue guidance |
| প্রস্তাবিত লক্ষ্য · অর্জিত নয় | Proposed target, not an achievement |
| ধারণাগত চিত্র | Conceptual visual |

| # | Est. time | Brief scene | Narration (sentences) | Visuals, each anchored to its spoken line |
|---|---|---|---|---|
| 1 | 0:00–1:05 | The opportunity begins | Title; new technology era; AI, cloud, banking, cyber; quantum economic potential; quantum randomness; science → business; venture; goal (9) | Natural Earth world map: Bangladesh in green, a Dhaka pulse, arcs to global hubs, a slow zoom. **SONICIUM ENTROPY** with the subtitle "কোয়ান্টাম র‍্যান্ডমনেসের বৈশ্বিক বাজারে নতুন সম্ভাবনা". Four sector chips; three idea cards; then the venture panel with the SQL logo and Entropy wordmark, and the flow quantum source → API service → software / enterprise / infrastructure. |
| 2 | 1:05–2:19 | The market is expanding | Why it matters; security uses; quantum measurement; service = commercial opportunity; QRNG forecast; $3.98B; quantum computing grows; not the same market; target position (10) | Use chips, then a three-step conversion (measurement → data → easy-to-use service). Then "বাজার বড় হচ্ছে": a QRNG bar chart (2025 $0.39B, 2026 $0.62B, 2030 $3.98B growing on the "৩.৯৮ বিলিয়ন" line, CAGR ≈ 59.1%) with its source. Two quantum-computing estimates ($4.24B and $20.20B) labelled "not added, not Sonicium's market". Nested markets with "API / cloud randomness" highlighted. |
| 3 | 2:19–2:52 | Meet Sonicium Entropy | API product structure; no own hardware needed; Q63/Q135, key auth, formats (3) | Five-node architecture with a moving packet. "Own QRNG hardware" (struck through) versus a one-call API with `YOUR_API_KEY`. Seven verified feature cards, including the 1,800 MB/s benchmark marked "workstation, not production API throughput". |
| 4 | 2:52–3:31 | Business model and recurring revenue | Beyond one API; four revenue paths; six customer types; different needs; tailored packages (5) | Six revenue channels and the real plan catalog (Free $0 · Professional $29 · Business $199 · Enterprise custom, with rate limits). Then six "potential" customer-segment cards, each with need and model, and the package formula. |
| 5 | 3:31–3:59 | First-mover strategy | First-mover advantage; early foundation; Bangladesh → international (3) | A flywheel (product → developer experience → customer relationships → partnerships) and a competitive landscape table of seven providers from public sources, with Sonicium's row highlighted. Differentiators, and an explicit "no 'first' or 'market leader' claim". |
| 6 | 3:59–4:28 | The commercial opportunity | Suppose $3.98B; 0.1% ≈ $3.98M; not guaranteed revenue; revenue depends on … (4) | TAM card and four share bars (0.01–1%) labelled **"Illustrative 2030 market-share scenarios — not company revenue guidance"**, with 0.1% highlighted. Then the TAM/SAM/SOM funnel ($3.98B / $597M assumption / $1.23M base case) and the bottom-up chart (conservative / base / growth, 2027–2030) with its drivers. |
| 7 | 4:28–4:55 | Roadmap and investment | Investment needed; what it funds; partners and new markets (3) | Four-phase roadmap with KPI targets tagged "লক্ষ্য". Six capital-deployment areas, labelled "no funding amount, valuation or equity offer". A partner network labelled "no signed partnership claimed". |
| 8 | 4:55–5:45 | The investment invitation | Bangladesh significance; research · workforce · export; clear goal; invitation; name; tagline (7) | Bangladesh outline. Three significance pillars and three goal items. Then **SONICIUM ENTROPY** with "কোয়ান্টাম র‍্যান্ডমনেসের বৈশ্বিক বাজারে বাংলাদেশের প্রযুক্তি উদ্যোগ", the final message, the **Investment & Strategic Partnership Opportunities** CTA, the tagline, and both websites. |

Sources and the reasoning behind every figure are in `sonicium_entropy_market_research.md`; editable numbers are in `sonicium_entropy_financial_model.json`.
