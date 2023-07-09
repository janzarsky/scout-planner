import {
  parseDate,
  parseDateTime,
  parseDuration,
  parseTime,
} from "./DateUtils";
import { getTimetableSettings } from "./TimetableSettings";

describe("getTimetableSettings()", () => {
  it("returns settings for now when there are no programs", () => {
    expect(
      getTimetableSettings(
        [],
        [],
        parseDuration("0:15"),
        parseDateTime("11:30 11.06.2022"),
      ),
    ).toEqual({
      days: [
        parseDate("11.06.2022"),
        parseDate("12.06.2022"),
        parseDate("13.06.2022"),
      ],
      dayStart: parseTime("10:00"),
      dayEnd: parseTime("16:00"),
      groupCnt: 1,
      groups: [],
      timeSpan: 4,
      timeStep: parseDuration("0:15"),
      timeHeaders: [
        parseTime("10:00"),
        parseTime("11:00"),
        parseTime("12:00"),
        parseTime("13:00"),
        parseTime("14:00"),
        parseTime("15:00"),
      ],
    });
  });

  it("returns settings for single program", () => {
    const prog = {
      begin: parseDateTime("08:00 10.10.2022"),
      duration: parseDuration("10:00"),
    };

    expect(
      getTimetableSettings(
        [prog],
        [],
        parseDuration("0:15"),
        parseDateTime("11:30 11.06.2022"),
      ),
    ).toEqual({
      days: [
        parseDate("10.10.2022"),
        parseDate("11.10.2022"),
        parseDate("12.10.2022"),
      ],
      dayStart: parseTime("8:00"),
      dayEnd: parseTime("18:00"),
      groupCnt: 1,
      groups: [],
      timeSpan: 4,
      timeStep: parseDuration("0:15"),
      timeHeaders: [
        parseTime("08:00"),
        parseTime("09:00"),
        parseTime("10:00"),
        parseTime("11:00"),
        parseTime("12:00"),
        parseTime("13:00"),
        parseTime("14:00"),
        parseTime("15:00"),
        parseTime("16:00"),
        parseTime("17:00"),
      ],
    });
  });

  it("returns rounded day start and end for programs not starting at the top of the hour", () => {
    const prog = {
      begin: parseDateTime("08:30 10.10.2022"),
      duration: parseDuration("10:00"),
    };

    expect(
      getTimetableSettings(
        [prog],
        [],
        parseDuration("0:15"),
        parseDateTime("11:30 11.06.2022"),
      ),
    ).toEqual({
      days: [
        parseDate("10.10.2022"),
        parseDate("11.10.2022"),
        parseDate("12.10.2022"),
      ],
      dayStart: parseTime("8:00"),
      dayEnd: parseTime("19:00"),
      groupCnt: 1,
      groups: [],
      timeSpan: 4,
      timeStep: parseDuration("0:15"),
      timeHeaders: [
        parseTime("08:00"),
        parseTime("09:00"),
        parseTime("10:00"),
        parseTime("11:00"),
        parseTime("12:00"),
        parseTime("13:00"),
        parseTime("14:00"),
        parseTime("15:00"),
        parseTime("16:00"),
        parseTime("17:00"),
        parseTime("18:00"),
      ],
    });
  });

  it("skips programs that are in tray", () => {
    const prog = {
      begin: null,
      duration: parseDuration("10:00"),
    };

    expect(
      getTimetableSettings(
        [prog],
        [],
        parseDuration("0:15"),
        parseDateTime("11:30 11.06.2022"),
      ),
    ).toEqual({
      days: [
        parseDate("11.06.2022"),
        parseDate("12.06.2022"),
        parseDate("13.06.2022"),
      ],
      dayStart: parseTime("10:00"),
      dayEnd: parseTime("16:00"),
      groupCnt: 1,
      groups: [],
      timeSpan: 4,
      timeStep: parseDuration("0:15"),
      timeHeaders: [
        parseTime("10:00"),
        parseTime("11:00"),
        parseTime("12:00"),
        parseTime("13:00"),
        parseTime("14:00"),
        parseTime("15:00"),
      ],
    });
  });
});
