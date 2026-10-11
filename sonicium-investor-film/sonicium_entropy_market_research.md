# Sonicium Entropy: market research, competitor analysis and methodology

Compiled 11 October 2026 for the investor film. Every figure on screen comes from this register or from `sonicium_entropy_financial_model.json`.

**How to read this document.** It keeps three kinds of information apart:

- **Third-party research:** published forecasts, cited with publisher, date and URL.
- **Verified product facts:** checked against the Sonicium Entropy repository (`hussainbillah/Sonicium-Entropy`, commit `4054f3b`).
- **Illustrations and assumptions:** our own arithmetic or planning inputs, labelled as such on screen.

**How the sources were checked.** Publisher pages could not be fetched directly from the build environment (DNS blocked), so the figures were confirmed through web search of the publishers' own pages and syndicated releases. Before the film is used externally, re-open each URL and confirm that the edition still shows the same numbers.

## 1. Global QRNG market (the TAM reference)

| Item | Value | Source |
|---|---|---|
| 2025 market size | USD 0.39 billion | The Business Research Company, *Quantum Random Number Generator (QRNG) Global Market Report*, 2026 edition |
| 2026 estimate | USD 0.62 billion (59.6% growth over 2025) | same |
| 2030 forecast | **USD 3.98 billion** | same |
| CAGR 2026–2030 | ≈ 59.1% | same |
| Segmentation | Type, deployment (cloud and on-premise) and application (banking, telecommunications, data centers and others) | same |
| URL | https://www.thebusinessresearchcompany.com/report/quantum-random-number-generator-qrng-global-market-report | reseller listing: https://www.researchandmarkets.com/reports/6103827/quantum-random-number-generator-qrng-market |

**Edition date.** The brief cited a "September 2026" page. The ResearchAndMarkets reseller lists the edition as February 2026, while the publisher page shows July 2026. The film therefore says "2026 edition" rather than a month.

**Definition.** The report covers the whole QRNG market, including hardware (chips, PCIe cards and appliances) as well as software and services. It is **not** the addressable market of an API service; see §4.

**Not plotted.** No intermediate values for 2027–2029 were available from an accessible source, so the chart shows 2025, 2026 and 2030 only, with a gap marker. No intermediate years are invented.

**Other QRNG publishers.** MarketsandMarkets has a QRNG report page, but its public page showed placeholder values. ResearchAndMarkets has a 2025–2040 study whose excerpts contain no dollar figures. Neither is used.

## 2. Quantum computing market, 2030 (context only)

| Publisher | 2030 value | Publication | URL |
|---|---|---|---|
| Grand View Research | USD 4.24 billion (CAGR 20.5%, 2025–2030) | February 2025 press release | https://www.grandviewresearch.com/press-release/global-quantum-computing-market |
| MarketsandMarkets | USD 20.20 billion (from USD 3.52B in 2025, CAGR 41.8%) | October 2025 press release (GlobeNewswire) | https://www.marketsandmarkets.com/Market-Reports/quantum-computing-market-144888301.html |

The estimates differ almost five-fold, because the publishers use different market definitions and methods. For comparison, BCC Research gives USD 7.3B and ResearchAndMarkets gives USD 7.48B for 2030. The film shows the two estimates the brief named side by side. It never adds them together, and it never presents them as Sonicium Entropy's market. Instead, a nested diagram places "API / cloud randomness services" inside the QRNG market, which sits inside the wider quantum-technology economy.

## 3. Competitive landscape

Product attributes come from public vendor material, as found on 11 October 2026. Vendor performance and certification claims were not independently tested.

| Provider | Origin | Delivery model | Category | Public evidence |
|---|---|---|---|---|
| ID Quantique (Quantis) | Switzerland | Chips, PCIe cards (e.g. PCIe-40M / 240M), USB, Quantis Appliance 2.0 | Hardware QRNG; the appliance is pitched for "randomness-as-a-service" inside customer networks | idquantique.com product pages. A third party, Quantum B, sells **msQRNG** on AWS Marketplace using IDQ chips. |
| QuintessenceLabs (qStream) | Australia | PCIe adapter, network appliance, subscription service; qRand entropy-management software | Hardware + service | QuintessenceLabs qRand product sheet; 2020 Business Wire release |
| Quside | Spain | QN100 chip-based entropy source; PCIe modules (Garnet series), FMC modules | Hardware QRNG | Quside / ICFO announcements, EU CORDIS project pages |
| QNu Labs | India | Tropos QRNG hardware; **Qosmos** entropy-as-a-service distributing randomness to applications via API | Entropy-as-a-service | qnulabs.com glossary page for Qosmos |
| Quantinuum (Quantum Origin) | UK / US | RESTful cloud API (keygen, randomness, onboard, usage), encrypted responses, subscription onboarding | Cloud service | Quantum Origin documentation (qo-docs.cambridgequantum.com); HPCwire, December 2021 |
| ANU QRNG | Australia | Free public JSON API, client libraries | Research / public service | ANU service and community client libraries |
| Amazon Braket | US | Blog demonstration of generating random numbers on multiple QPUs | Demonstration, not a product | AWS Quantum Technologies blog |
| Quantum Dice | UK | — | — | **Not verified.** Searches returned no usable product source, so it is excluded from the on-screen table. |

**Strategic reading (our analysis, not vendor fact).** Hardware QRNG (chips, cards and appliances) is the established segment. Cloud and API delivery already exists: Quantinuum, QNu Labs' Qosmos, ANU, and a Quantis-based service on AWS Marketplace. **Sonicium Entropy is therefore not the first API service, and the film does not say it is.**

Its differentiation, verifiable in its own repository:

1. It is hardware-agnostic: entropy comes from cloud-accessed superconducting QPUs, so the business is not tied to building QRNG hardware.
2. Every response carries provenance: register, DRBG algorithm and health-test status.
3. Seeds carry an Ed25519 attestation that can be verified offline.
4. Self-serve pricing starts at $29 a month.
5. It is a South-Asia-based team selling to international customers.

## 4. TAM, SAM and SOM

| Layer | Value | Basis |
|---|---|---|
| **TAM** | USD 3.98B (2030) | The published QRNG forecast (§1) |
| **SAM** | USD 597M | TAM × **15% assumption** for randomness delivered as a cloud or API service. The report segments by deployment, but its cloud/on-premise split was not accessible, so the share is an explicit, editable assumption (`tam_sam_som.sam_share_of_tam_assumption`). |
| **SOM** | USD 1.23M | The 2030 annual run-rate of the bottom-up **base case** (§5), which is ≈ 0.03% of TAM and ≈ 0.2% of SAM. The SOM is derived from customer assumptions, not taken as a share of TAM. |

**Market-share illustrations.** The film shows 0.01%, 0.1%, 0.5% and 1% of USD 3.98B, which is $398K, $3.98M, $19.9M and $39.8M. These are pure arithmetic and are labelled "Illustrative 2030 market-share scenarios — not company revenue guidance".

## 5. Bottom-up revenue scenarios (assumptions)

The **prices are real**: the list prices in `packages/billing/src/plans.ts` (Free $0, Professional $29/month, Business $199/month, Enterprise custom). **Everything else is assumed:** customer counts, enterprise ACV, integration fees, the usage uplift, partner-channel revenue and research access. All of it is editable in `sonicium_entropy_financial_model.json`.

| Year-end run-rate | 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|
| Conservative | $22K | $109K | $218K | $388K |
| Base | $119K | $356K | $721K | $1.23M |
| Growth | $271K | $843K | $1.87M | $3.41M |

These numbers come from `node tools/build_data.mjs`. The formula is given in that file's header.

## 6. Product facts used on screen (verified)

| Statement | Source in the repository |
|---|---|
| `GET https://api.soniciumentropy.com/v1/random`, Bearer API key, hex / base64 / binary | `packages/sdk/src/transport.ts`, `apps/api/src/api-gateway/schemas.ts`, `random.controller.ts` |
| Q63 / Q135 registers, fixed per key | SDK READMEs; `entropySource = superconducting_qubit_q${n}` |
| Provenance on every response; SP 800-90B RCT/APT health tests; SP 800-90A DRBG | `random.controller.ts`, `docs/industry-readiness.md` |
| Ed25519-attested seeds, verifiable offline | `packages/sdk/README.md`, `services/drbg-engine/src/drbg_engine/attestation.py` |
| Rate limits of 60 / 300 / 1,000 / 6,000 requests per minute by plan | `packages/billing/src/plans.ts` |
| ~1,800 MB/s CTR-DRBG expansion, **measured on a developer workstation, not production** | `docs/throughput-and-capacity.md` |

## 7. Claims requested but not shown, and why

| Claim | Status |
|---|---|
| "10,000 API requests per second" | **Not supported.** The repository records a *10,000-call* test against production on 2026-09-06, which averaged ~2.8 requests/s and was throttled by a since-fixed misconfiguration. The highest plan limit is 6,000 requests per **minute**. |
| "Output capability exceeding 18 GB/s" | **Contradicted by the project's own documentation.** `docs/throughput-and-capacity.md` has a section titled "Why 18 GB/s is not an API figure": that rate would be 144 Gbit/s of egress, beyond the delivery path. The measured DRBG figure is ~1.8 GB/s on a workstation. |
| Dashboard screenshots | Not included. Rendering the authenticated dashboard needs the full stack and a database, which were not available here. The film uses diagrams instead, and does not present them as screenshots. |
| Customers, contracts, investors, certifications, funding amount, valuation | None exist in the sources, so none are shown. |
