from ..models import SavedScheduleSection, Section, Schedule


def get_conflicts(saved_schedule_id: int, new_section_id: int) -> list:
    saved_schedule_sections = SavedScheduleSection.query.filter_by(saved_schedule_id=saved_schedule_id).all()
    if not saved_schedule_sections:
        return []

    new_schedules = Schedule.query.filter_by(section_id=new_section_id).all()
    if not new_schedules:
        return []

    section_ids = [s.section_id for s in saved_schedule_sections]
    sections_by_id = {
        s.id: s for s in Section.query.filter(Section.id.in_(section_ids)).all()
    }

    conflicts = []

    for saved_schedule_section in saved_schedule_sections:
        saved_schedules = Schedule.query.filter_by(section_id=saved_schedule_section.section_id).all()
        if not saved_schedules:
            continue

        for saved_schedule in saved_schedules:
            for new_sched in new_schedules:
                if saved_schedule.day != new_sched.day:
                    continue

                times = [saved_schedule.start_time, saved_schedule.end_time, new_sched.start_time, new_sched.end_time]
                if any(t is None or len(t) != 4 for t in times):
                    continue

                if new_sched.start_time < saved_schedule.end_time and saved_schedule.start_time < new_sched.end_time:
                    section = sections_by_id.get(saved_schedule_section.section_id)
                    conflicts.append({
                        "conflicting_section_id": saved_schedule_section.section_id,
                        "conflicting_crn": section.crn if section else None,
                        "day": saved_schedule.day,
                        "existing_start": saved_schedule.start_time,
                        "existing_end": saved_schedule.end_time,
                        "new_start": new_sched.start_time,
                        "new_end": new_sched.end_time,
                    })

    return conflicts
