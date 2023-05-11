import { groupProgramsToBlocks } from "./TimetableUtils";

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
