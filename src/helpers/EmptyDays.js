import { parseDuration } from "./DateUtils";

/**
 * Add empty days so that the timetable is not "confusing"
 *
 * The timetable shows only days that contain at least one program. This may be confusing in
 * certain situations:
 *  - consider a Fri-Sun event, when you delete everything on Saturday, it will disappear.
 *    Ideally, the day should remain there.
 *  - when creating a new event, there should be some free days so that drag and drop is easier,
 *    so if you start with event on Friday, there should be also Saturday and Sunday
 *
 * @param days at least one day must be supplied
 */
export function addEmptyDays(days) {
  const dayLength = parseDuration("24:00");

  // if there are at most 3 missing days, add them
  const missingDaysLimit = 3;
  const missingDays = (last, curr) =>
    curr - last < (missingDaysLimit + 2) * dayLength
      ? Array.from(
          { length: (curr - last) / dayLength - 1 },
          (_, i) => last + (i + 1) * dayLength
        )
      : [];

  const extendedDays = days.reduce((prev, curr) => {
    return [
      ...prev,
      ...(prev.length > 0 ? missingDays(prev[prev.length - 1], curr) : []),
      curr,
    ];
  }, []);

  // make sure there are always at least 3 days shown
  const minDaysLimit = 3;
  if (extendedDays.length < minDaysLimit)
    return extendedDays.concat(
      Array.from(
        { length: minDaysLimit - extendedDays.length },
        (_, i) => extendedDays[extendedDays.length - 1] + (i + 1) * dayLength
      )
    );

  return extendedDays;
}
