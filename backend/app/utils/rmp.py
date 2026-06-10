import base64
import time
from datetime import datetime, timedelta

import requests

GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql"
PAGE_SIZE = 20
SYNC_STALE_DAYS = 7

HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0",
}

RATINGS_QUERY = """
query TeacherRatingsListQuery(
  $id: ID!
  $count: Int!
  $cursor: String
) {
  node(id: $id) {
    ... on Teacher {
      id
      ratings(first: $count, after: $cursor) {
        edges {
          node {
            id
            comment
            qualityRating
            difficultyRating
            date
            class
            wouldTakeAgain
            helpfulRating
            clarityRating
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
}
"""


def legacy_id_from_rmp_id(rmp_id):
    """Decode RMP GraphQL id (e.g. VGVhY2hlci0xMjMxMDU5) to numeric legacy id."""
    if not rmp_id:
        return None
    try:
        decoded = base64.b64decode(rmp_id).decode("utf-8")
        if decoded.startswith("Teacher-"):
            return decoded.split("-", 1)[1]
    except Exception:
        pass
    return None


def parse_rmp_date(date_str):
    if not date_str:
        return None
    try:
        cleaned = date_str.replace(" UTC", "").strip()
        return datetime.strptime(cleaned, "%Y-%m-%d %H:%M:%S %z").replace(tzinfo=None)
    except Exception:
        return None


def _would_take_again_value(raw):
    if raw == 1:
        return True
    if raw == 0:
        return False
    return None


def _parse_rating_node(node):
    return {
        "rmp_id": node.get("id"),
        "rating": node.get("qualityRating"),
        "difficulty": node.get("difficultyRating"),
        "comment": node.get("comment"),
        "course": node.get("class"),
        "review_date": parse_rmp_date(node.get("date")),
        "would_take_again": _would_take_again_value(node.get("wouldTakeAgain")),
        "helpful_rating": node.get("helpfulRating"),
        "clarity_rating": node.get("clarityRating"),
    }


def serialize_rmp_review(review):
    return {
        "id": review.id,
        "source": "ratemyprofessors",
        "rating": review.rating,
        "difficulty": review.difficulty,
        "comment": review.comment,
        "course": review.course,
        "date": review.review_date.isoformat() if review.review_date else None,
        "would_take_again": review.would_take_again,
        "helpful_rating": review.helpful_rating,
        "clarity_rating": review.clarity_rating,
    }


def _fetch_rmp_ratings_page(rmp_id, count=PAGE_SIZE, cursor=None):
    variables = {
        "id": rmp_id,
        "count": min(count, PAGE_SIZE),
        "cursor": cursor,
    }
    response = requests.post(
        GRAPHQL_URL,
        json={"query": RATINGS_QUERY, "variables": variables},
        headers=HEADERS,
        timeout=15,
    )
    response.raise_for_status()
    payload = response.json()

    if payload.get("errors"):
        messages = [e.get("message", "Unknown error") for e in payload["errors"]]
        raise ValueError("; ".join(messages))

    teacher = (payload.get("data") or {}).get("node")
    if not teacher:
        return [], False, None

    ratings_data = teacher.get("ratings") or {}
    edges = ratings_data.get("edges") or []
    page_info = ratings_data.get("pageInfo") or {}

    nodes = [edge["node"] for edge in edges if edge.get("node")]
    return nodes, page_info.get("hasNextPage", False), page_info.get("endCursor")


def _upsert_rating_nodes(professor, nodes, db, RmpReview, now):
    upserted = 0
    for node in nodes:
        parsed = _parse_rating_node(node)
        rmp_id = parsed.get("rmp_id")
        if not rmp_id:
            continue

        existing = RmpReview.query.filter_by(rmp_id=rmp_id).first()
        if existing:
            existing.professor_id = professor.id
            existing.rating = parsed["rating"]
            existing.difficulty = parsed["difficulty"]
            existing.comment = parsed["comment"]
            existing.course = parsed["course"]
            existing.review_date = parsed["review_date"]
            existing.would_take_again = parsed["would_take_again"]
            existing.helpful_rating = parsed["helpful_rating"]
            existing.clarity_rating = parsed["clarity_rating"]
            existing.synced_at = now
        else:
            db.session.add(RmpReview(
                professor_id=professor.id,
                rmp_id=rmp_id,
                rating=parsed["rating"],
                difficulty=parsed["difficulty"],
                comment=parsed["comment"],
                course=parsed["course"],
                review_date=parsed["review_date"],
                would_take_again=parsed["would_take_again"],
                helpful_rating=parsed["helpful_rating"],
                clarity_rating=parsed["clarity_rating"],
                synced_at=now,
            ))
        upserted += 1

    db.session.commit()
    return upserted


def sync_professor_rmp_reviews(professor, db, RmpReview, max_pages=None):
    """Fetch RMP reviews for a professor and upsert into rmp_reviews."""
    if not professor.rmp_id:
        return 0

    cursor = None
    upserted = 0
    now = datetime.utcnow()
    pages_fetched = 0

    while True:
        nodes, has_more, cursor = _fetch_rmp_ratings_page(professor.rmp_id, cursor=cursor)
        upserted += _upsert_rating_nodes(professor, nodes, db, RmpReview, now)
        pages_fetched += 1

        if not has_more:
            break
        if max_pages is not None and pages_fetched >= max_pages:
            break
        time.sleep(0.5)

    return upserted


def needs_rmp_review_sync(professor_id, RmpReview, force=False):
    if force:
        return True
    latest = (
        RmpReview.query
        .filter_by(professor_id=professor_id)
        .order_by(RmpReview.synced_at.desc())
        .first()
    )
    if not latest:
        return True
    stale_after = datetime.utcnow() - timedelta(days=SYNC_STALE_DAYS)
    return latest.synced_at < stale_after
