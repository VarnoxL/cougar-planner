import csv
import requests
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Data source: IBHE (Illinois Board of Higher Education) grade distribution CSVs
# These are publicly available — no login required.
# You'll need to find the correct URL and SIUE's institution code from the IBHE Data Arena:
#   https://www.ibhe.org/DataArena/main.html
#
# IBHE_BASE = "https://www.ibhe.org/DataArena/GradeDistribution/"
# SIUE_INSTITUTION_CODE = "???"  # Look this up in the CSV — usually a 3-digit code


def download_csv(semester_code: str) -> list:
    """
    Download the IBHE grade distribution CSV for a given semester.
    Parse it with csv.DictReader and return a list of row dicts.

    Before processing rows, validate that the expected column names exist.
    Raise a ValueError loudly if they don't — better to crash than silently skip data.

    Steps:
    1. Build the URL for the given semester_code
    2. GET the URL with requests
    3. Decode the response text and wrap in csv.DictReader
    4. Check that required columns are present in the headers
    5. Filter rows to only SIUE rows (by institution code)
    6. Return the list of matching rows
    """
    pass


def parse_row(row: dict) -> dict | None:
    """
    Map an IBHE CSV row to the fields we need for GradeDistribution.

    Important: IBHE stores professor names as "Last, First" but our DB uses "First Last".
    You'll need to reverse the name before looking up the professor.

    Return a dict with:
    {
        "subject": str,
        "course_number": str,
        "professor_name": str,   # already converted to "First Last"
        "semester": str,
        "a_count": int,
        "b_count": int,
        "c_count": int,
        "d_count": int,
        "f_count": int,
        "w_count": int,
    }
    Return None if the row can't be parsed (e.g., missing fields).
    """
    pass


def upsert_grade_distributions(rows: list):
    """
    For each parsed row, find the matching Professor and Course in the DB,
    then upsert a GradeDistribution record.

    Steps:
    1. Create the Flask app and push an app context (see rmp_scraper.py for the pattern)
    2. For each row:
       a. Find Professor by name match (Professor.name == row["professor_name"])
          Skip the row if not found
       b. Find Course by subject + number match
          Skip the row if not found
       c. Query for an existing GradeDistribution by (professor_id, course_id, semester)
          If found: update the count fields
          If not found: create a new GradeDistribution
       d. db.session.add() and commit (commit in batches of ~10 for performance)
    """
    pass


if __name__ == "__main__":
    # Accept a semester code as a CLI argument, e.g.: python grade_scraper.py 202520
    # Then call download_csv, parse each row, and upsert
    pass
