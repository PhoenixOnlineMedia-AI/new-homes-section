#!/usr/bin/env python3
import argparse
import csv
import re
import sys
from typing import Dict, List, Tuple


STATE_RE = re.compile(r"^[A-Z]{2}$")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
NOISY_RE = re.compile(
    r"(find your|explore|quick move|move-in|new homes? in|community|communities|floor plan|browse|search)",
    re.IGNORECASE,
)


def clean_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip())


def validate_row(row: Dict[str, str]) -> Tuple[bool, List[str]]:
    errors: List[str] = []
    builder_name = clean_spaces(row.get("builder_name", ""))
    builder_slug = clean_spaces(row.get("builder_slug", ""))
    city = clean_spaces(row.get("city", ""))
    state_code = clean_spaces(row.get("state_code", "")).upper()

    if not builder_name:
        errors.append("missing_builder_name")
    if not builder_slug or not SLUG_RE.match(builder_slug):
        errors.append("invalid_builder_slug")
    if not city:
        errors.append("missing_city")
    if not STATE_RE.match(state_code):
        errors.append("invalid_state_code")

    if city:
        if len(city) > 40:
            errors.append("city_too_long")
        if any(ch.isdigit() for ch in city):
            errors.append("city_contains_digit")
        words = city.split()
        if len(words) > 3:
            errors.append("city_too_many_words")
        if NOISY_RE.search(city):
            errors.append("city_noisy_phrase")

    return (len(errors) == 0), errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate builder market rows before ingestion.")
    parser.add_argument("--input", required=True, help="Input CSV path")
    parser.add_argument("--out", required=True, help="Output cleaned CSV path")
    parser.add_argument("--rejects", required=True, help="Output rejected CSV path")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        required = ["builder_name", "builder_slug", "city", "state_code"]
        if any(col not in (reader.fieldnames or []) for col in required):
            print("Input CSV missing required columns", file=sys.stderr)
            return 2

        rows = list(reader)

    seen = set()
    cleaned: List[Dict[str, str]] = []
    rejected: List[Dict[str, str]] = []

    for row in rows:
        row = dict(row)
        row["builder_name"] = clean_spaces(row.get("builder_name", ""))
        row["builder_slug"] = clean_spaces(row.get("builder_slug", ""))
        row["city"] = clean_spaces(row.get("city", ""))
        row["state_code"] = clean_spaces(row.get("state_code", "")).upper()

        ok, reasons = validate_row(row)
        dedupe_key = (
            row.get("builder_slug", "").lower(),
            row.get("city", "").lower(),
            row.get("state_code", "").upper(),
        )

        if ok and dedupe_key not in seen:
            seen.add(dedupe_key)
            cleaned.append(row)
        else:
            rejected_row = dict(row)
            if dedupe_key in seen and ok:
                reasons = ["duplicate_row"]
            rejected_row["reject_reason"] = "|".join(reasons) if reasons else "unknown"
            rejected.append(rejected_row)

    cleaned_headers = ["builder_name", "builder_slug", "city", "state_code"]
    reject_headers = cleaned_headers + ["reject_reason"]

    with open(args.out, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=cleaned_headers)
        writer.writeheader()
        writer.writerows(cleaned)

    with open(args.rejects, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=reject_headers)
        writer.writeheader()
        writer.writerows(rejected)

    print(
        f"validated={len(rows)} kept={len(cleaned)} rejected={len(rejected)}",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
