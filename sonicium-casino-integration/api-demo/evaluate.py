"""Controlled technical evaluation of the Sonicium Entropy API (Python 3.9+, stdlib only).

The "controlled test application" from the video: sends N authenticated
GET /v1/random requests from a backend test service, validates every
response, and reports latency (p50 / p95), status-code counts, health-check
results and an illustrative cost per million requests. It is a measurement
tool for a proof of concept; it does not touch any live game, wallet or
wagering path.

    export SONICIUM_API_KEY=...     # from your secret manager, never hard-coded
    python3 evaluate.py --requests 200 --pause 1.0 --monthly-fee 500 --monthly-requests 10000000
    python3 evaluate.py --dry-run   # offline: no key, no network; checks the pipeline only

Pace --pause to stay inside your plan's per-minute limit (60 / 300 / 1,000 /
6,000 requests per minute for Free / Professional / Business / Enterprise);
the per-minute 429 carries Retry-After and the client waits for it.
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
import sys
import time

from sonicium_client import SAMPLE, SoniciumError, fetch_random, validate


def pct(values: list[float], p: float) -> float:
    s = sorted(values)
    return s[min(len(s) - 1, max(0, round(p / 100 * (len(s) - 1))))]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--requests", type=int, default=50)
    ap.add_argument("--length", type=int, default=32)
    ap.add_argument("--format", choices=["hex", "base64"], default="hex")
    ap.add_argument("--pause", type=float, default=1.0, help="seconds between requests")
    ap.add_argument("--monthly-fee", type=float, default=None, help="agreed monthly fee (USD), for cost per million")
    ap.add_argument("--monthly-requests", type=int, default=None)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    api_key = os.environ.get("SONICIUM_API_KEY", "")
    if not args.dry_run and (not api_key or api_key in ("YOUR_API_KEY", "YOUR_SONICIUM_API_KEY")):
        print("Set SONICIUM_API_KEY from your secret manager (the placeholder is not a key).", file=sys.stderr)
        return 2

    latencies, statuses, health_fail = [], {}, 0
    for i in range(args.requests):
        t0 = time.perf_counter()
        try:
            if args.dry_run:
                body, length, fmt = SAMPLE, 32, "hex"  # offline: validates the sample only
            else:
                body = fetch_random(api_key, args.length, args.format)
                length, fmt = args.length, args.format
            try:
                validate(body, length, fmt)
            except ValueError:
                health_fail += 1
            if not args.dry_run:
                latencies.append((time.perf_counter() - t0) * 1000)
            statuses["200"] = statuses.get("200", 0) + 1
        except SoniciumError as e:
            statuses[str(e.status or "network")] = statuses.get(str(e.status or "network"), 0) + 1
            if e.status == 401 or (e.status == 429 and e.retry_after is None):
                break  # bad key or monthly quota: retrying cannot help
        if not args.dry_run and i < args.requests - 1:
            time.sleep(args.pause)

    report = {
        "mode": "dry-run (offline: no latency measured)" if args.dry_run else "live",
        "requests_sent": sum(statuses.values()),
        "status_counts": statuses,
        "error_rate": round(1 - statuses.get("200", 0) / max(1, sum(statuses.values())), 4),
        "responses_failing_validation": health_fail,
    }
    if latencies:
        report["latency_ms"] = {"p50": round(statistics.median(latencies), 1), "p95": round(pct(latencies, 95), 1), "max": round(max(latencies), 1)}
    if args.monthly_fee is not None and args.monthly_requests:
        report["illustrative_service_cost_per_million_usd"] = round(args.monthly_fee / (args.monthly_requests / 1e6), 2)
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
