Review my implementation of the conflict detection function in backend/app/utils/conflict.py.

Read the file, then check for the following. Explain *why* each issue matters and hint toward the fix — don't rewrite it for me.

## Checklist

**Early exits**
- Does the function return `[]` immediately if there are no existing sections in the schedule?
- Does the function return `[]` immediately if the new section has no Schedule rows (async/online)?

**Time comparison correctness**
- Times are stored as zero-padded 4-char strings like `"0930"` or `"1300"`.
  Are both values being compared as strings? (This works because they're fixed-width.)
- Is the overlap condition correct?
  Two time ranges [A_start, A_end) and [B_start, B_end) overlap when:
    `A_start < B_end AND B_start < A_end`
  A common mistake is using `<=` instead of `<`, which would flag back-to-back classes as conflicts.

**TBA/null guard**
- Are `None` values skipped before comparing?
- Are malformed times (length != 4) skipped? A non-zero-padded time like `"900"` would compare incorrectly.

**Day matching**
- Is the day check happening before the time check? (No point comparing times if days differ.)

**Conflict dict shape**
- Does each conflict entry include: `conflicting_section_id`, `conflicting_crn`, `day`,
  `existing_start`, `existing_end`, `new_start`, `new_end`?
- Is `crn` accessed safely in case the Section lookup returns None?
