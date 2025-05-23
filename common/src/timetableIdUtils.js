const idRegex = /^[a-zA-Z0-9_-]+$/;

export function isValidTimetableId(id) {
  return idRegex.test(id) && id.length >= 3;
}
