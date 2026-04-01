Review the scraper file at $ARGUMENTS.

Read the file carefully, then check for each of the following. For every issue found, explain *why* it matters and hint toward the fix — don't rewrite for me.

## Checklist

**App context**
- Is the Flask app context set up before any DB operations?
  Pattern: `app = create_app()` then `with app.app_context():`
  See rmp_scraper.py for the established pattern.

**Upsert correctness**
- Does the scraper query before inserting to avoid duplicate rows?
  Pattern: query by unique key first → update if found, insert if not.
  See siue_scraper.py lines 133–151 for the established pattern.
- Is `db.session.commit()` called? (Either per-record or in batches)

**Rate limiting**
- Is there a delay between requests (e.g. `time.sleep(1)`) to avoid hammering the source?

**Error handling**
- If an HTTP request fails (non-200 status), does the scraper handle it or crash silently?
- If an expected field is missing from the response, does it fail loudly or skip silently?
  Loud failures (raise/print) are preferred over silent skips that hide data problems.

**Name matching**
- If matching professors by name, is the format consistent with how the DB stores names ("First Last")?
  External sources often use "Last, First" — make sure there's a normalization step.

**Main block**
- Is there an `if __name__ == "__main__":` block so the scraper can be run standalone?
