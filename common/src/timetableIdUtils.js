import { v4 as uuidv4 } from "uuid";

const idRegex = /^[a-zA-Z0-9_-]+$/;

export function isValidTimetableId(id) {
  return idRegex.test(id) && id.length >= 3;
}

export function generateTimetableId() {
  return uuidv4().substring(0, 6);
}
