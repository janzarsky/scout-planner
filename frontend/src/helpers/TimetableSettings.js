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

  let validPrograms = programs.filter((p) => typeof p.begin === "number");

  if (validPrograms.length === 0)
    validPrograms = [{ begin: now, duration: hour }];

  var settings = {};

  settings.days = [];
  for (const prog of validPrograms) {
    settings.days.push(getOnlyDate(prog.begin));
  }
  settings.days = [...new Set(settings.days)].sort();
  settings.days = addEmptyDays(settings.days);

  settings.dayStart = parseTime("10:00");
  for (const prog of validPrograms) {
    const time = getOnlyTime(prog.begin);
    if (time < settings.dayStart) settings.dayStart = time;
  }

  settings.dayStart = roundDownToWholeHours(settings.dayStart);

  settings.dayEnd = parseTime("16:00");
  for (const prog of validPrograms) {
    let time = getOnlyTime(prog.begin + prog.duration);
    if (time === 0) time = parseTime("23:59");
    if (time > settings.dayEnd) settings.dayEnd = time;
  }

  settings.dayEnd = roundUpToWholeHours(settings.dayEnd);

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

const hour = parseDuration("1:00");

function roundDownToWholeHours(time) {
  return time - (time % hour);
}

function roundUpToWholeHours(time) {
  return time - (time % hour) + (time % hour !== 0 ? hour : 0);
}
