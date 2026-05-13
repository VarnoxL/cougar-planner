import { SEMESTER_OPTIONS } from './constants'

const STORAGE_KEY = 'cougar_guest_schedule'

export function loadGuestSchedule() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) throw new Error()
    const parsed = JSON.parse(raw)
    if (!parsed.semester || !Array.isArray(parsed.sections)) throw new Error()
    return parsed
  } catch {
    return { semester: SEMESTER_OPTIONS[0].value, sections: [] }
  }
}

export function saveGuestSchedule(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function toMinutes(hhmm) {
  return parseInt(hhmm.slice(0, 2)) * 60 + parseInt(hhmm.slice(2, 4))
}

export function detectConflicts(existingSections, candidateSection) {
  const conflicts = []
  for (const existing of existingSections) {
    for (const existingSlot of existing.schedules ?? []) {
      for (const newSlot of candidateSection.schedules ?? []) {
        if (
          existingSlot.day === newSlot.day &&
          existingSlot.start_time && existingSlot.end_time &&
          newSlot.start_time && newSlot.end_time &&
          toMinutes(existingSlot.start_time) < toMinutes(newSlot.end_time) &&
          toMinutes(newSlot.start_time) < toMinutes(existingSlot.end_time)
        ) {
          conflicts.push({
            conflicting_crn: existing.crn,
            day: existingSlot.day,
            existing_start: existingSlot.start_time,
            existing_end: existingSlot.end_time,
            new_start: newSlot.start_time,
            new_end: newSlot.end_time,
          })
        }
      }
    }
  }
  return conflicts
}

export function isDuplicate(existingSections, candidateSectionId) {
  return existingSections.some(s => s.id === candidateSectionId)
}
