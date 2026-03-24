import sys
import time
import requests

SCHOOL_ID = "U2Nob29sLTcxMQ=="
GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql"
PAGE_SIZE = 20

# RMP requires this auth header
HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
}

QUERY = """
query TeacherSearchPaginationQuery(
  $count: Int!
  $cursor: String
  $query: TeacherSearchQuery!
) {
  search: newSearch {
    teachers(query: $query, first: $count, after: $cursor) {
      edges {
        node {
          id
          legacyId
          firstName
          lastName
          department
          avgRating
          avgDifficulty
          wouldTakeAgainPercent
          numRatings
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      resultCount
    }
  }
}
"""


def fetch_page(cursor=None):
    variables = {
        "count": PAGE_SIZE,
        "cursor": cursor,
        "query": {
            "fallback": True,
            "schoolID": SCHOOL_ID,
        },
    }
    response = requests.post(
        GRAPHQL_URL,
        json={"query": QUERY, "variables": variables},
        headers=HEADERS,
        timeout=15,
    )
    response.raise_for_status()
    return response.json()


def scrape_all_professors():
    professors = []
    cursor = None
    total = None
    page = 0

    while True:
        try:
            data = fetch_page(cursor)
        except Exception as e:
            print(f"  [ERROR] Failed to fetch page (cursor={cursor}): {e}", file=sys.stderr)
            break

        teachers_data = data.get("data", {}).get("search", {}).get("teachers", {})
        edges = teachers_data.get("edges", [])
        page_info = teachers_data.get("pageInfo", {})

        if total is None:
            total = teachers_data.get("resultCount", "?")
            print(f"Total professors found: {total}")

        for edge in edges:
            node = edge.get("node", {})
            professors.append({
                "rmp_id": node.get("id"),
                "name": f"{node.get('firstName', '')} {node.get('lastName', '')}".strip(),
                "department": node.get("department"),
                "rating": node.get("avgRating"),
                "difficulty": node.get("avgDifficulty"),
                "would_take_again": node.get("wouldTakeAgainPercent"),
                "num_ratings": node.get("numRatings"),
            })

        page += 1
        print(f"  Fetched page {page} — {len(professors)}/{total} professors so far...")

        if not page_info.get("hasNextPage"):
            break

        cursor = page_info.get("endCursor")
        time.sleep(1)

    return professors


def upsert_professors(professors):
    from app import create_app, db
    from app.models import Professor

    app = create_app()
    with app.app_context():
        created = 0
        updated = 0
        skipped = 0

        for i, prof_data in enumerate(professors, 1):
            try:
                rmp_id = prof_data.get("rmp_id")
                if not rmp_id:
                    skipped += 1
                    continue

                existing = Professor.query.filter_by(rmp_id=rmp_id).first()

                if existing:
                    existing.name = prof_data["name"]
                    existing.department = prof_data["department"]
                    existing.rating = prof_data["rating"]
                    existing.difficulty = prof_data["difficulty"]
                    existing.would_take_again = prof_data["would_take_again"]
                    existing.num_ratings = prof_data["num_ratings"]
                    updated += 1
                else:
                    new_prof = Professor(
                        rmp_id=rmp_id,
                        name=prof_data["name"],
                        department=prof_data["department"],
                        rating=prof_data["rating"],
                        difficulty=prof_data["difficulty"],
                        would_take_again=prof_data["would_take_again"],
                        num_ratings=prof_data["num_ratings"],
                    )
                    db.session.add(new_prof)
                    created += 1

                if i % 10 == 0:
                    print(f"  Saved {i}/{len(professors)} professors...")
                    db.session.commit()

            except Exception as e:
                print(f"  [ERROR] Skipping professor '{prof_data.get('name')}': {e}", file=sys.stderr)
                db.session.rollback()
                skipped += 1

        db.session.commit()
        print(f"\nDone. Created: {created} | Updated: {updated} | Skipped: {skipped}")


if __name__ == "__main__":
    print("Scraping RMP data for SIUE (School ID 711)...")
    professors = scrape_all_professors()
    print(f"\nScraped {len(professors)} professors total. Saving to database...")
    upsert_professors(professors)
