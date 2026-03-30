# SIUE Course Catalog Scraper
# See plan at .claude/plans/splendid-seeking-anchor.md for full implementation details

import requests
import sys
import time
import re
import os
from dotenv import load_dotenv
load_dotenv()

# SIUE Banner 9 API URLs (no auth required)
BASE_URL = "https://banner.siue.edu/StudentRegistrationSsb/ssb"
TERM_URL = f"{BASE_URL}/term/search"
SUBJECTS_URL = f"{BASE_URL}/classSearch/get_subject"
SEARCH_URL = f"{BASE_URL}/searchResults/searchResults"
DELAY = 1 # seconds
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; cougar-planner/1.0; +https://cougar-planner.com)"
}

TERM = os.getenv("SIUE_TERM")


def create_session():
    session = requests.Session()
    session.headers.update(HEADERS)

    # Initialize the term — Banner 9 requires this before any search
    response = session.post(
        f"{TERM_URL}?mode=search",
        data={"term": TERM},
        timeout=15,
    )
    response.raise_for_status()
    print(f"Session initialized for term {TERM}")
    return session


def fetch_subjects(session):
    response = session.get(
        SUBJECTS_URL,
        params={"searchTerm": "", "term": TERM, "offset": 1, "max": 500},
        timeout=15,
    )
    response.raise_for_status()
    subjects = [s["code"] for s in response.json()]
    print(f"Found {len(subjects)} subjects")
    return subjects


if __name__ == "__main__":
    session = create_session()
    subjects = fetch_subjects(session)
    print(subjects)
