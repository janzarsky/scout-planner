const idRegex = /^[a-zA-Z0-9_-]+$/;

export function isValidTimetableId(id) {
  return idRegex.test(id) && id.length >= 3;
}

export function generateTimetableId() {
  return Math.floor(Math.random() * 10e13).toString(16);
}
