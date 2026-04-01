from ..models import SavedScheduleSection, Section, Schedule


def get_conflicts(saved_schedule_id: int, new_section_id: int) -> list:
    """
    Check whether a new section conflicts with any section already in a saved schedule.

    Steps to implement:
    1. Query all SavedScheduleSection rows for saved_schedule_id to get existing section IDs.
       If there are none, return [] early — nothing to conflict with.

    2. Query Schedule rows for new_section_id.
       If there are none (async/online), return [] early — no times to compare.

    3. For each existing section ID, load its Schedule rows.
       For each pair of (new_schedule, existing_schedule):
         - Skip if the days don't match.
         - Skip if any time value is None or not exactly 4 characters (TBA sections).
         - Times are stored as zero-padded strings like "0930" or "1300".
           Two ranges overlap when: new_start < existing_end AND existing_start < new_end
         - If they overlap, append a dict to a conflicts list.

    4. Return the conflicts list (empty if no conflicts found).

    Conflict dict shape:
    {
        "conflicting_section_id": int,
        "conflicting_crn": str,
        "day": str,
        "existing_start": str,
        "existing_end": str,
        "new_start": str,
        "new_end": str,
    }
    """
    pass
