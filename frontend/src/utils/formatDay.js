const DAY_MAP = {
  monday:    ['M', 'Mon'],
  tuesday:   ['T', 'Tue'],
  wednesday: ['W', 'Wed'],
  thursday:  ['R', 'Thu'],
  friday:    ['F', 'Fri'],
}

export function formatDay(dayStr, pill = false) {
  if (!dayStr) return null
  const entry = DAY_MAP[dayStr.toLowerCase().trim()]
  if (!entry) return null
  return pill ? entry[0] : entry[1]
}
