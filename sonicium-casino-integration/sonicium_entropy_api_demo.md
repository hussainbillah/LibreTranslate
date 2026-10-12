# Sonicium Entropy API — integration demo for a casino platform

Every API detail here was checked against the Sonicium Entropy implementation:
- `apps/api/src/api-gateway/random.controller.ts` and `schemas.ts`
- `apps/api/src/api-gateway/usage.controller.ts` and `usage.service.ts`
- `packages/billing/src/plans.ts`
- `packages/sdk/src/transport.ts`
- `apps/docs/src/lib/api-reference.ts`

The sample values below are examples, not a real draw.

> **Credentials.** The video and this document show only the fictional placeholder `YOUR_SONICIUM_API_KEY`. In code, the key is read from the `SONICIUM_API_KEY` environment variable, loaded from a secret manager on the backend. Never put it in a browser, a mobile app, a log line or a repository.

> **Scope.** This is a technical evaluation from a backend test service. It is not an approved game RNG. Any use connected to live wagering must follow:
> - the game's approved outcome-generation design;
> - the applicable regulations;
> - independent testing-laboratory requirements.

## 1. Request

```bash
export SONICIUM_API_KEY="YOUR_SONICIUM_API_KEY"   # placeholder; load the real one from your secret manager

curl -sS --max-time 10 \
  "https://api.soniciumentropy.com/v1/random?length=32&format=hex" \
  -H "Authorization: Bearer $SONICIUM_API_KEY"
```

| Parameter | Values | Default |
|---|---|---|
| `length` | 1 … the key's per-call limit (65,536 bytes unless configured otherwise) | 32 |
| `format` | `hex`, `base64` (JSON responses), `binary` (raw `application/octet-stream`) | `hex` |

Keys look like `sk_…`. Fleet device tokens issued under a key look like `sk_dev_…`.

## 2. Response (sample values)

```json
{
  "data": "4cc5673986cbff63e4c2a4b28df98d4c1978319fbfd305dccc4bcd7c8e74e56a",
  "length": 32,
  "format": "hex",
  "register": "Q135",
  "drbgAlgorithm": "CTR-DRBG-AES-256",
  "entropySource": "superconducting_qubit_q135",
  "healthCheck": { "rct": "passed", "apt": "passed", "excludedChannels": [] },
  "seedEpoch": 412,
  "seedId": null,
  "sourceJobIds": [],
  "servedAt": "2026-10-10T09:30:00.000Z"
}
```

Validate before use:
- `format` and `length` must match the request.
- The decoded byte count must equal `length`.
- `register` must be `Q63` or `Q135`.
- `healthCheck.rct` and `healthCheck.apt` must be `"passed"`. `"unknown"` means the source has not been tested yet; handle it per your policy.

## 3. Error handling

| HTTP | Meaning | Client action |
|---|---|---|
| 400 | Invalid `length` or `format` | Fix the request |
| 401 | Invalid, revoked or expired key | Fix the credential; do not retry |
| 413 | Over the key's per-call length limit | Split into smaller requests |
| 429 + `Retry-After` | Per-minute rate limit | Wait `Retry-After`, then retry |
| 429, no `Retry-After` | Monthly quota spent | Stop; waiting does not help (raise the tier) |
| 502 | Upstream engine unreachable | Retry with backoff |
| 503 + `Retry-After` (60 s) | Entropy pool refilling | Wait, then retry |
| timeout / network | No response | `GET` is safe to retry, with a bounded number of attempts |

## 4. Usage monitoring

- **Per key:** each key has a per-minute rate limit and a monthly quota.
- **Catalog plans** (`packages/billing/src/plans.ts`):

  | Plan | Price | Requests per minute | Requests per month |
  |---|---|---|---|
  | Free | $0 | 60 | 10k |
  | Professional | $29/month | 300 | 250k |
  | Business | $199/month | 1,000 | 2M |
  | Enterprise | custom agreement | 6,000 | 25M |

- **Signed usage export:** `GET /api-keys/{apiKeyId}/usage/export?from=<ISO 8601>&to=<ISO 8601>`.
  - **Authentication:** a **dashboard session token**. API keys are not accepted on this route.
  - **Response:** `{ csv, sha256, certificate, recordCount, from, to }`, with one CSV row per successful draw.
  - **Limits:** a window of at most 400 days and up to 100,000 rows per export.
  - **Offline verification:**
    1. Compute SHA-256 over `csv` exactly as returned.
    2. Compare it with `certificate.materialSha256`.
    3. Verify the certificate against the platform's attestation public key.

## 5. Controlled evaluation harness

`api-demo/` contains standard-library Python with no third-party dependencies:
- **`sonicium_client.py`** is the client. It does the following:
  - reads the key from `SONICIUM_API_KEY`;
  - requires HTTPS;
  - retries only 502, 503, network errors and per-minute 429s, honouring `Retry-After`;
  - validates every response;
  - never logs the key or the random data.
- **`evaluate.py`** is the "controlled test application" shown in the video. It sends N paced requests and reports:
  - status counts;
  - error rate;
  - validation failures;
  - latency p50 / p95.

```bash
cd api-demo
python3 evaluate.py --dry-run --requests 5                 # offline pipeline check: no key, no network
export SONICIUM_API_KEY=...                                # from your secret manager
python3 evaluate.py --requests 200 --pause 1.0 \
  --monthly-fee 500 --monthly-requests 10000000            # live measurement (pace under your plan's limit)
```

The dry run prints no latency figures. Only a live run against your own key measures latency.

## 6. Cost calculation (illustrative)

The video's ROI scene uses the sample inputs from the brief. They are recomputed by `tools/build_data.mjs` from `sonicium_entropy_roi_calculator.json`.

| Item | Formula | Sample |
|---|---|---|
| Monthly recurring cost | fee + operations = 500 + 100 | $600 |
| First-year total cost | integration + 12 × monthly = 2,000 + 7,200 | $9,200 |
| First-year requests | 12 × 10,000,000 | 120,000,000 |
| Cost per million requests | 9,200 ÷ 120 | $76.67 |
| Annual measurable benefit | 12 × 1,000 (client-verified) | $12,000 |
| Net first-year benefit | 12,000 − 9,200 | $2,800 |
| First-year ROI | 2,800 ÷ 9,200 × 100 | ≈ 30.4% |

**ILLUSTRATIVE SCENARIO — NOT A CUSTOMER FORECAST OR GUARANTEED RETURN.**
- The $500 fee is a sample assumption, not a Sonicium Entropy price or quotation.
- 10 million requests a month exceeds the Business plan's 2M quota, so this workload would fall under an Enterprise agreement.
- 10 million a month averages about 3.9 requests per second, inside the Enterprise limit of 6,000 per minute.
- The benefit must be measured by the client in a pilot. Quantum randomness does not increase revenue, change the house edge, or prove game fairness.
