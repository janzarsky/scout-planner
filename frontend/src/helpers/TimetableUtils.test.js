import { groupProgramsToBlocks } from "./TimetableUtils";

test("empty", () => {
  expect(groupProgramsToBlocks([])).toEqual([]);
});

test("one program", () => {
  const progA = { begin: 0, duration: 60, groups: ["first"] };

  expect(groupProgramsToBlocks([progA])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
  ]);
});

test("two programs with non-overlapping time", () => {
  const progA = { begin: 0, duration: 60, groups: ["first"] };
  const progB = { begin: 90, duration: 60, groups: ["first"] };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    { programs: [progB], begin: 90, duration: 60, groups: ["first"] },
  ]);
});

test("two programs with different groups", () => {
  const progA = { begin: 0, duration: 60, groups: ["first"] };
  const progB = { begin: 0, duration: 60, groups: ["second"] };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    { programs: [progB], begin: 0, duration: 60, groups: ["second"] },
  ]);
});

test("two programs with overlapping time", () => {
  const progA = { begin: 0, duration: 60, groups: ["first"] };
  const progB = { begin: 30, duration: 60, groups: ["first"] };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA, progB], begin: 0, duration: 90, groups: ["first"] },
  ]);
});

test("two programs right after each other", () => {
  const progA = { begin: 0, duration: 60, groups: ["first"] };
  const progB = { begin: 60, duration: 60, groups: ["first"] };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    { programs: [progB], begin: 60, duration: 60, groups: ["first"] },
  ]);
});

test("two programs with overlapping times and groups", () => {
  const progA = { begin: 0, duration: 60, groups: ["first", "second"] };
  const progB = { begin: 0, duration: 60, groups: ["second", "third"] };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first", "second"] },
    { programs: [progB], begin: 0, duration: 60, groups: ["second", "third"] },
  ]);
});

test("three programs with overlapping time", () => {
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
