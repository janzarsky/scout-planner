import { groupProgramsToBlocks } from "./TimetableUtils";

test("empty", () => {
  expect(groupProgramsToBlocks([])).toEqual([]);
});

test("one program", () => {
  const progA = {
    begin: 0,
    duration: 60,
    groups: ["first"],
  };

  expect(groupProgramsToBlocks([progA])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
  ]);
});

test("two programs with non-overlapping time", () => {
  const progA = {
    begin: 0,
    duration: 60,
    groups: ["first"],
  };
  const progB = {
    begin: 90,
    duration: 60,
    groups: ["first"],
  };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    { programs: [progB], begin: 90, duration: 60, groups: ["first"] },
  ]);
});

test("two programs with different groups", () => {
  const progA = {
    begin: 0,
    duration: 60,
    groups: ["first"],
  };
  const progB = {
    begin: 0,
    duration: 60,
    groups: ["second"],
  };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA], begin: 0, duration: 60, groups: ["first"] },
    { programs: [progB], begin: 0, duration: 60, groups: ["second"] },
  ]);
});

test("two programs with overlapping time", () => {
  const progA = {
    begin: 0,
    duration: 60,
    groups: ["first"],
  };
  const progB = {
    begin: 30,
    duration: 60,
    groups: ["first"],
  };

  expect(groupProgramsToBlocks([progA, progB])).toEqual([
    { programs: [progA, progB], begin: 0, duration: 90, groups: ["first"] },
  ]);
});
