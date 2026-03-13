#!/usr/bin/env python3
import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from urllib.parse import urlparse


def normalize_domain(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        return ""
    if "://" not in raw:
        raw = f"https://{raw}"
    parsed = urlparse(raw)
    host = (parsed.netloc or "").lower()
    if not host:
        return ""
    return f"https://{host}"


def clean_builder_name(name: str) -> str:
    return re.sub(r"\s+", " ", (name or "").strip())


def main() -> int:
    parser = argparse.ArgumentParser(description="Convert state seed CSV into normalized grouped output.")
    parser.add_argument("--input", required=True, help="Path to CSV with state_code,name,domain")
    parser.add_argument(
        "--format",
        choices=["json", "ts"],
        default="json",
        help="Output format",
    )
    args = parser.parse_args()

    grouped = defaultdict(dict)
    total_rows = 0
    kept_rows = 0

    with open(args.input, "r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"state_code", "name", "domain"}
        if not required.issubset(set(reader.fieldnames or [])):
            print("Missing required columns: state_code,name,domain", file=sys.stderr)
            return 2

        for row in reader:
            total_rows += 1
            state = (row.get("state_code") or "").strip().upper()
            name = clean_builder_name(row.get("name") or "")
            domain = normalize_domain(row.get("domain") or "")
            if not state or not name or not domain:
                continue
            key = domain.lower()
            if key in grouped[state]:
                continue
            grouped[state][key] = {"builder_name": name, "site_url": domain}
            kept_rows += 1

    normalized = {
        state: sorted(values.values(), key=lambda x: (x["builder_name"].lower(), x["site_url"]))
        for state, values in sorted(grouped.items())
    }

    if args.format == "json":
        print(json.dumps(normalized, indent=2))
    else:
        print("const SEEDED_BUILDERS_BY_STATE: Record<string, { builder_name: string; site_url: string }[]> = {")
        for state, builders in normalized.items():
            print(f"    {state}: [")
            for builder in builders:
                name = builder["builder_name"].replace("'", "\\'")
                url = builder["site_url"].replace("'", "\\'")
                print(f"        {{ builder_name: '{name}', site_url: '{url}' }},")
            print("    ],")
        print("}")

    print(
        json.dumps(
            {"input_rows": total_rows, "normalized_rows": kept_rows, "states": len(normalized)},
            separators=(",", ":"),
        ),
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
