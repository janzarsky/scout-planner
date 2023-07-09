import { parseDate, parseDuration } from "./DateUtils";
import { parseDateTime, parseTime } from "./DateUtils";
import { getRect, groupProgramsToBlocks } from "./TimetableUtils";

describe("groupProgramsToBlocks()", () => {
  it("returns empty array when there are no programs", () => {
    expect(groupProgramsToBlocks([])).toEqual([]);
  });

  it("returns one block for one program", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };

    expect(groupProgramsToBlocks([progA])).toEqual([
      { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    ]);
  });

  it("returns two blocks for two programs with non-overlapping time and the same group", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 90, duration: 60, groups: ["first"] };

    expect(groupProgramsToBlocks([progA, progB])).toEqual([
      { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
      { programs: [progB], begin: 90, duration: 60, groups: ["first"] },
    ]);
  });

  it("returns two blocks for two programs with overlapping time but different groups", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 0, duration: 60, groups: ["second"] };

    expect(groupProgramsToBlocks([progA, progB])).toEqual([
      { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
      { programs: [progB], begin: 0, duration: 60, groups: ["second"] },
    ]);
  });

  it("returns one block for two programs with overlapping time and the same group", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 30, duration: 60, groups: ["first"] };

    expect(groupProgramsToBlocks([progA, progB])).toEqual([
      { programs: [progA, progB], begin: 0, duration: 90, groups: ["first"] },
    ]);
  });

  it("returns two blocks for two programs right after each other", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 60, duration: 60, groups: ["first"] };

    expect(groupProgramsToBlocks([progA, progB])).toEqual([
      { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
      { programs: [progB], begin: 60, duration: 60, groups: ["first"] },
    ]);
  });

  it("returns two blocks for two programs with overlapping times and groups", () => {
    // this setup is not supported - we need to create two blocks for the overlap error to show
    const progA = { begin: 0, duration: 60, groups: ["first", "second"] };
    const progB = { begin: 0, duration: 60, groups: ["second", "third"] };

    expect(groupProgramsToBlocks([progA, progB])).toEqual([
      {
        programs: [progA],
        begin: 0,
        duration: 60,
        groups: ["first", "second"],
      },
      {
        programs: [progB],
        begin: 0,
        duration: 60,
        groups: ["second", "third"],
      },
    ]);
  });

  it("returns one block for three programs with overlapping time", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 40, duration: 60, groups: ["first"] };
    const progC = { begin: 80, duration: 60, groups: ["first"] };

    expect(groupProgramsToBlocks([progA, progB, progC])).toEqual([
      {
        programs: [progA, progB, progC],
        begin: 0,
        duration: 140,
        groups: ["first"],
      },
    ]);
  });
});

describe("getRect()", () => {
  const settings = {
    days: [
      parseDate("10.06.2022"),
      parseDate("11.06.2022"),
      parseDate("12.06.2022"),
    ],
    dayStart: parseTime("10:00"),
    dayEnd: parseTime("16:00"),
    groupCnt: 1,
    groups: [],
    timeSpan: 4,
    timeStep: parseDuration("0:15"),
  };

  it("returns rectangle for program without groups", () => {
    expect(
      getRect(
        parseDateTime("11:30 11.06.2022"),
        parseDuration("1:00"),
        [],
        settings,
      ),
    ).toEqual({
      x: 6,
      y: 1,
      width: 4,
      height: 1,
    });
  });

  it("returns rectangle for program starting at misaligned time", () =>
    expect(
      getRect(
        parseDateTime("11:23 11.06.2022"),
        parseDuration("1:14"),
        [],
        settings,
      ),
    ).toEqual({ x: 6, y: 1, width: 5, height: 1 }));

  it("returns rectangle for short program", () =>
    expect(
      getRect(
        parseDateTime("11:30 11.06.2022"),
        parseDuration("0:01"),
        [],
        settings,
      ),
    ).toEqual({ x: 6, y: 1, width: 1, height: 1 }));

  it("returns rectangle for program with groups", () => {
    const settingsWithGroups = {
      ...settings,
      groupCnt: 4,
      groups: [
        { _id: "group1" },
        { _id: "group2" },
        { _id: "group3" },
        { _id: "group4" },
      ],
    };
    expect(
      getRect(
        parseDateTime("11:30 11.06.2022"),
        parseDuration("1:00"),
        ["group2", "group3"],
        settingsWithGroups,
      ),
    ).toEqual({ x: 6, y: 5, width: 4, height: 2 });
  });
});
