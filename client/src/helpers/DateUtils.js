export function formatDate(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybné datum)";

  return `${date.getUTCDate()}.${
    date.getUTCMonth() + 1
  }.${date.getUTCFullYear()}`;
}

export function formatDateWithTray(ms) {
  return typeof ms === "number" ? formatDate(ms) : "(odkladiště)";
}

export function formatTime(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybný čas)";

  return `${date.getUTCHours()}:${
    date.getUTCMinutes() < 10 ? "0" : ""
  }${date.getUTCMinutes()}`;
}

export function formatTimeWithTray(ms) {
  return typeof ms === "number" ? formatTime(ms) : "(odkladiště)";
}

export function formatDateTime(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybné datum)";

  return (
    `${date.getUTCHours()}:${
      date.getUTCMinutes() < 10 ? "0" : ""
    }${date.getUTCMinutes()} ` +
    `${date.getUTCDate()}.${date.getUTCMonth() + 1}.${date.getUTCFullYear()}`
  );
}

export function formatDuration(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybná délka)";

  return `${date.getUTCHours() + (date.getUTCDate() - 1) * 24}:${
    date.getUTCMinutes() < 10 ? "0" : ""
  }${date.getUTCMinutes()}`;
}

export function formatDurationInMinutes(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybná délka)";

  return `${
    24 * 60 * (date.getUTCDate() - 1) +
    60 * date.getUTCHours() +
    date.getUTCMinutes()
  } min`;
}

export function formatDay(ms) {
  const date = new Date(parseInt(ms));

  if (isNaN(date.getTime())) return "(chybný den)";

  return ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"][(date.getUTCDay() + 6) % 7];
}

export function parseDate(str) {
  const vals = str.split(".");
  return Date.UTC(
    parseInt(vals[2], 10),
    parseInt(vals[1], 10) - 1,
    parseInt(vals[0], 10),
  );
}

export function parseTime(str) {
  const vals = str.split(":");
  return Date.UTC(1970, 0, 1, parseInt(vals[0], 10), parseInt(vals[1], 10));
}

export function parseDateTime(str) {
  const [time, date] = str.split(" ");
  return parseDate(date) + parseTime(time);
}

export function parseDuration(str) {
  return parseTime(str);
}

export function getOnlyTime(ms) {
  const d = new Date(ms);
  return Date.UTC(1970, 0, 1, d.getUTCHours(), d.getUTCMinutes());
}

export function getOnlyDate(ms) {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
