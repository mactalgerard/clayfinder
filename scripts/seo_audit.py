"""
ClayFinder — DataForSEO On-Page SEO Audit
==========================================
Crawls clayfinder.com and writes a categorised issues report to
scripts/seo_audit_report.txt.

Dependencies (one-time install):
    pip install requests python-dotenv

Credentials: copy .env.example to .env and fill in, OR set env vars:
    DATAFORSEO_LOGIN    — your DataForSEO account email
    DATAFORSEO_PASSWORD — your DataForSEO API password

Usage:
    python scripts/seo_audit.py

The crawl takes 5–20 minutes depending on site size. The script polls
automatically and writes the report when complete.
"""

import base64
import json
import os
import time
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

load_dotenv()

TARGET_URL = "https://www.clayfinder.com"
MAX_PAGES_TO_CRAWL = 500          # keep costs low; covers all page types
MAX_PAGES_IN_REPORT = 50          # top N pages by issue count in report
POLL_INTERVAL_SECONDS = 30
MAX_POLL_ATTEMPTS = 60            # 30 min timeout

BASE_URL = "https://api.dataforseo.com"

SCRIPT_DIR = Path(__file__).parent
REPORT_PATH = SCRIPT_DIR / "seo_audit_report.txt"

# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

def _auth_headers() -> dict:
    login = os.getenv("DATAFORSEO_LOGIN")
    password = os.getenv("DATAFORSEO_PASSWORD")
    if not login or not password:
        raise SystemExit(
            "ERROR: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD must be set.\n"
            "Copy scripts/.env.example to .env and fill them in."
        )
    token = base64.b64encode(f"{login}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}", "Content-Type": "application/json"}


HEADERS = _auth_headers()

# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def post(path: str, payload: list) -> dict:
    resp = requests.post(f"{BASE_URL}{path}", headers=HEADERS, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()


def get(path: str) -> dict:
    resp = requests.get(f"{BASE_URL}{path}", headers=HEADERS, timeout=60)
    resp.raise_for_status()
    return resp.json()

# ---------------------------------------------------------------------------
# Step 1 — Start crawl task
# ---------------------------------------------------------------------------

def start_crawl() -> str:
    print(f"[1/4] Starting on-page crawl of {TARGET_URL} ...")
    data = post("/v3/on_page/task_post", [{
        "target": TARGET_URL,
        "max_crawl_pages": MAX_PAGES_TO_CRAWL,
        "load_resources": False,        # faster, we don't need resource data
        "enable_javascript": False,
        "check_spell": False,
        "calculate_keyword_density": False,
    }])
    task = data["tasks"][0]
    if task["status_code"] != 20100:
        raise SystemExit(f"Failed to create task: {task['status_message']}")
    task_id = task["id"]
    print(f"    Task created: {task_id}")
    return task_id

# ---------------------------------------------------------------------------
# Step 2 — Poll until ready
# ---------------------------------------------------------------------------

def wait_for_task(task_id: str) -> None:
    print(f"[2/4] Waiting for crawl to complete (polling every {POLL_INTERVAL_SECONDS}s) ...")
    for attempt in range(1, MAX_POLL_ATTEMPTS + 1):
        time.sleep(POLL_INTERVAL_SECONDS)
        data = get("/v3/on_page/tasks_ready")
        ready_ids = [
            t["id"]
            for t in (data.get("tasks") or [])
            for r in (t.get("result") or [])
            for t in [r]  # each result item is a dict with "id"
            if isinstance(r, dict) and r.get("id") == task_id
        ]
        # Simpler approach: check if our task_id appears in any result
        raw = json.dumps(data)
        if task_id in raw:
            print(f"    Crawl complete after ~{attempt * POLL_INTERVAL_SECONDS // 60}m {(attempt * POLL_INTERVAL_SECONDS) % 60}s.")
            return
        elapsed = attempt * POLL_INTERVAL_SECONDS
        print(f"    Still crawling... ({elapsed // 60}m {elapsed % 60}s elapsed)")

    raise SystemExit("Timeout: crawl did not complete within 30 minutes.")

# ---------------------------------------------------------------------------
# Step 3 — Fetch results
# ---------------------------------------------------------------------------

def fetch_summary(task_id: str) -> dict:
    data = post("/v3/on_page/summary", [{"id": task_id}])
    result = (data["tasks"][0].get("result") or [None])[0]
    return result or {}


ISSUE_CHECKS = [
    "is_4xx_page", "no_description", "duplicate_title", "no_h1_tag",
    "is_redirect", "low_content_rate", "is_broken", "no_image_alt",
    "title_too_long", "title_too_short", "description_too_long",
    "duplicate_description",
]


def fetch_pages_with_issues(task_id: str) -> list:
    """Fetch all crawled pages then filter client-side to those with issues."""
    all_items: list = []
    limit = 100
    offset = 0

    while True:
        data = post("/v3/on_page/pages", [{
            "id": task_id,
            "limit": limit,
            "offset": offset,
        }])
        result = (data["tasks"][0].get("result") or [None])[0]
        if not result:
            break
        items = result.get("items") or []
        all_items.extend(items)
        total = result.get("total_count", 0)
        offset += limit
        if offset >= total or not items:
            break

    # Filter to pages that have at least one failing check
    def has_issue(page: dict) -> bool:
        checks = page.get("checks") or {}
        return any(checks.get(k) is True for k in ISSUE_CHECKS)

    flagged = [p for p in all_items if has_issue(p)]

    # Sort by number of failing checks descending
    flagged.sort(key=lambda p: sum(
        1 for k in ISSUE_CHECKS if (p.get("checks") or {}).get(k) is True
    ), reverse=True)

    return flagged[:MAX_PAGES_IN_REPORT]


def fetch_all_pages_summary(task_id: str) -> dict:
    """Get counts of each check type across all crawled pages."""
    data = post("/v3/on_page/pages", [{
        "id": task_id,
        "limit": 1,   # we just want the total_count
    }])
    result = data["tasks"][0].get("result", [{}])[0] or {}
    return result

# ---------------------------------------------------------------------------
# Step 4 — Write report
# ---------------------------------------------------------------------------

def fmt_check(label: str, value) -> str:
    if isinstance(value, bool):
        return f"  {'✗' if value else '✓'}  {label}"
    return f"  {label}: {value}"


def write_report(summary: dict, pages: list) -> None:
    print(f"[4/4] Writing report to {REPORT_PATH} ...")
    lines = []

    lines.append("=" * 70)
    lines.append("ClayFinder — DataForSEO On-Page SEO Audit")
    lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    lines.append(f"Target: {TARGET_URL}")
    lines.append("=" * 70)
    lines.append("")

    # --- Site summary ---
    lines.append("SITE SUMMARY")
    lines.append("-" * 40)
    onpage_score = summary.get("onpage_score")
    if onpage_score is not None:
        lines.append(f"  On-Page Score:       {onpage_score:.1f} / 100")
    lines.append(f"  Pages crawled:       {summary.get('crawled_pages', 'N/A')}")
    lines.append(f"  Internal links:      {summary.get('internal_links_count', 'N/A')}")
    lines.append(f"  Broken links:        {summary.get('broken_links', 'N/A')}")
    lines.append(f"  Non-indexable pages: {summary.get('non_indexable', 'N/A')}")
    lines.append("")

    # --- Issue counts from summary checks ---
    checks = summary.get("page_metrics", {}).get("checks", {})
    if checks:
        lines.append("ISSUE BREAKDOWN (pages affected)")
        lines.append("-" * 40)
        issue_map = {
            "no_description":       "Missing meta description",
            "no_h1_tag":            "Missing H1 tag",
            "duplicate_title":      "Duplicate title",
            "duplicate_description": "Duplicate meta description",
            "is_4xx_page":          "4xx error pages",
            "is_redirect":          "Redirect pages",
            "is_broken":            "Broken pages",
            "low_content_rate":     "Low content / thin pages",
            "no_image_alt":         "Images missing alt text",
            "title_too_long":       "Title too long (>60 chars)",
            "title_too_short":      "Title too short (<30 chars)",
            "description_too_long": "Meta description too long (>160 chars)",
            "high_loading_time":    "Slow page load time",
            "is_https":             "Not HTTPS",
            "canonical_chain":      "Canonical chain",
        }
        found_any = False
        for key, label in issue_map.items():
            val = checks.get(key)
            if val is not None and val != 0 and val is not False:
                lines.append(f"  {label:<40} {val}")
                found_any = True
        if not found_any:
            lines.append("  No major issues detected in summary.")
    lines.append("")

    # --- Pages with issues ---
    if pages:
        lines.append(f"PAGES WITH ISSUES (top {len(pages)} flagged)")
        lines.append("-" * 40)
        for page in pages:
            url = page.get("url", "")
            status = page.get("status_code", "")
            checks_failed = [k for k, v in (page.get("checks") or {}).items() if v is True]
            lines.append(f"\n  {url}")
            lines.append(f"  Status: {status}")
            if checks_failed:
                lines.append(f"  Issues: {', '.join(checks_failed)}")
    else:
        lines.append("PAGES WITH ISSUES")
        lines.append("-" * 40)
        lines.append("  No pages flagged with issues — or filter returned no results.")

    lines.append("")
    lines.append("=" * 70)
    lines.append("END OF REPORT")
    lines.append("=" * 70)

    REPORT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(f"    Done. Open {REPORT_PATH.name} to see results.")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    task_id = start_crawl()
    wait_for_task(task_id)
    print("[3/4] Fetching results ...")
    summary = fetch_summary(task_id)
    pages = fetch_pages_with_issues(task_id)
    write_report(summary, pages)
