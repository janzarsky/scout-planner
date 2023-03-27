import { byOrder } from "../helpers/Sorting";
import {
  getOnlyDate,
  getOnlyTime,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";
import { addEmptyDays } from "../helpers/EmptyDays";

export function getTimetableSettings(programs, groups, timeStep, now) {
  const hour = parseDuration("1:00");

  if (programs.length === 0) programs = [{ begin: now, duration: hour }];

  var settings = {};

  settings.days = [];
  for (const prog of programs) {
    settings.days.push(getOnlyDate(prog.begin));
  }
  settings.days = [...new Set(settings.days)].sort();
  settings.days = addEmptyDays(settings.days);

  settings.dayStart = parseTime("10:00");
  for (const prog of programs) {
    const time = getOnlyTime(prog.begin);
    if (time < settings.dayStart) settings.dayStart = time;
  }

  settings.dayEnd = parseTime("16:00");
  for (const prog of programs) {
    let time = getOnlyTime(prog.begin + prog.duration);
    if (time === 0) time = parseTime("23:59");
    if (time > settings.dayEnd) settings.dayEnd = time;
  }

  settings.timeHeaders = Array.from(
    { length: Math.ceil((settings.dayEnd - settings.dayStart) / hour) },
    (_, idx) => settings.dayStart + idx * hour
  );
  settings.timeStep = timeStep;
  settings.timeSpan = Math.ceil(hour / timeStep);
  settings.groups = [...groups].sort(byOrder);
  settings.groupCnt = groups.length > 0 ? groups.length : 1;

  return settings;
}
