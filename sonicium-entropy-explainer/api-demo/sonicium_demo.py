"""Sonicium Entropy — integration demo (Python 3.9+, standard library only).

Draws random bytes from GET /v1/random, validates the response, and derives
an example session token. Matches the contract in the Sonicium Entropy
repository (apps/api/src/api-gateway/random.controller.ts, schemas.ts and
packages/sdk/src/transport.ts):

  * Base URL      https://api.soniciumentropy.com (override: SONICIUM_BASE_URL)
  * Auth          Authorization: Bearer <API key>   (sk_… or device token sk_dev_…)
  * Query         length = 1 … the key's per-call limit (65,536 by default), default 32
                  format = hex | base64 | binary
  * JSON fields   data, length, format, register, drbgAlgorithm, entropySource,
                  healthCheck{rct, apt, excludedChannels}, seedEpoch, seedId,
                  sourceJobIds, servedAt
  * Errors        401 bad key · 413 over per-call limit · 429 rate limit (Retry-After)
                  or monthly quota · 502 engine unreachable · 503 pool refilling (Retry-After)

The API key is read from the SONICIUM_API_KEY environment variable and is
never printed or logged. Usage:

    export SONICIUM_API_KEY=...        # from your secret manager, never hard-coded
    python3 sonicium_demo.py --length 32 --format hex
    python3 sonicium_demo.py --dry-run  # offline: validates a built-in sample response
"""
from __future__ import annotations

import argparse
import base64
import json
import logging
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

DEFAULT_BASE_URL = "https://api.soniciumentropy.com"
TIMEOUT_S = 30          # same per-attempt default as the official SDKs
MAX_RETRIES = 2         # GET is safe to retry
MAX_RETRY_DELAY_S = 60
REGISTERS = {"Q63", "Q135"}

log = logging.getLogger("sonicium-demo")


class SoniciumError(Exception):
    def __init__(self, status: int | None, message: str, retry_after: float | None = None):
        super().__init__(f"{status or 'network'}: {message}")
        self.status = status
        self.retry_after = retry_after


def _retryable(err: SoniciumError) -> bool:
    if err.status is None or err.status in (502, 503):
        return True
    # 429 with Retry-After is the per-minute rate limit; 429 without it is the
    # monthly quota, where waiting does not help.
    return err.status == 429 and err.retry_after is not None


def fetch_random(api_key: str, length: int = 32, fmt: str = "hex", base_url: str | None = None) -> dict:
    if fmt not in ("hex", "base64"):
        raise ValueError("this demo uses the JSON formats: hex or base64")
    base = (base_url or os.environ.get("SONICIUM_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
    if not base.startswith("https://"):
        raise ValueError("refusing to send an API key over a non-HTTPS connection")
    url = f"{base}/v1/random?" + urllib.parse.urlencode({"length": length, "format": fmt})
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "User-Agent": "sonicium-explainer-demo/1.0",
    })

    for attempt in range(MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                # Audit metadata only: never the key, never the random data.
                log.info("GET /v1/random status=%s length=%s register=%s attempt=%d",
                         resp.status, body.get("length"), body.get("register"), attempt + 1)
                return body
        except urllib.error.HTTPError as e:
            ra = e.headers.get("Retry-After")
            try:
                detail = json.loads(e.read().decode("utf-8")).get("message", e.reason)
            except Exception:
                detail = e.reason
            err = SoniciumError(e.code, str(detail), float(ra) if ra and ra.isdigit() else None)
        except (urllib.error.URLError, TimeoutError) as e:
            err = SoniciumError(None, str(getattr(e, "reason", e)))
        log.warning("attempt %d failed: %s", attempt + 1, err)
        if attempt == MAX_RETRIES or not _retryable(err):
            raise err
        time.sleep(min(err.retry_after if err.retry_after is not None else 2 ** attempt, MAX_RETRY_DELAY_S))
    raise AssertionError("unreachable")


def validate(body: dict, length: int, fmt: str, require_health: bool = True) -> bytes:
    """Rejects anything that does not match the documented response contract."""
    for field in ("data", "length", "format", "register", "drbgAlgorithm", "entropySource", "healthCheck", "servedAt"):
        if field not in body:
            raise ValueError(f"response is missing '{field}'")
    if body["format"] != fmt:
        raise ValueError(f"asked for {fmt}, got {body['format']}")
    if body["length"] != length:
        raise ValueError(f"asked for {length} bytes, got {body['length']}")
    raw = bytes.fromhex(body["data"]) if fmt == "hex" else base64.b64decode(body["data"], validate=True)
    if len(raw) != length:
        raise ValueError(f"decoded {len(raw)} bytes, expected {length}")
    if body["register"] not in REGISTERS:
        raise ValueError(f"unexpected register {body['register']!r}")
    hc = body["healthCheck"]
    if require_health and (hc.get("rct") != "passed" or hc.get("apt") != "passed"):
        # "unknown" means the source has not been tested yet; treat per your policy.
        raise ValueError(f"health check not passed: rct={hc.get('rct')} apt={hc.get('apt')}")
    return raw


# Illustrative sample (values are examples, not a real draw) for --dry-run.
SAMPLE = {
    "data": "4cc5673986cbff63e4c2a4b28df98d4c1978319fbfd305dccc4bcd7c8e74e56a",
    "length": 32,
    "format": "hex",
    "register": "Q135",
    "drbgAlgorithm": "CTR-DRBG-AES-256",
    "entropySource": "superconducting_qubit_q135",
    "healthCheck": {"rct": "passed", "apt": "passed", "excludedChannels": []},
    "seedEpoch": 412,
    "seedId": None,
    "sourceJobIds": [],
    "servedAt": "2026-10-10T09:30:00.000Z",
}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--length", type=int, default=32)
    ap.add_argument("--format", choices=["hex", "base64"], default="hex")
    ap.add_argument("--dry-run", action="store_true", help="validate the built-in sample; no network, no key")
    ap.add_argument("--allow-unknown-health", action="store_true")
    args = ap.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

    if args.dry_run:
        body = SAMPLE
        args.length, args.format = 32, "hex"
    else:
        api_key = os.environ.get("SONICIUM_API_KEY", "")
        if not api_key or api_key == "YOUR_API_KEY":
            print("Set SONICIUM_API_KEY from your secret manager (the placeholder is not a key).", file=sys.stderr)
            return 2
        body = fetch_random(api_key, args.length, args.format)

    raw = validate(body, args.length, args.format, require_health=not args.allow_unknown_health)
    # Application-specific use. Here: a URL-safe session token. Do not print or
    # log real key material in production — this demo prints only a token
    # derived from a dry-run sample or a throwaway draw.
    token = base64.urlsafe_b64encode(raw).rstrip(b"=").decode()
    print(json.dumps({
        "validated": True,
        "bytes": len(raw),
        "register": body["register"],
        "drbgAlgorithm": body["drbgAlgorithm"],
        "healthCheck": body["healthCheck"],
        "servedAt": body["servedAt"],
        "exampleSessionTokenPrefix": token[:6] + "…",
    }, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
