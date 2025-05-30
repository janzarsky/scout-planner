import { describe, expect, it } from "vitest";
import { testing } from "./Shift";

const { getTimetableBeginning } = testing;

describe("get timetable beginning", () => {
  it("returns null when there are no programs", () =>
    expect(getTimetableBeginning([])).toBeNull);

  it("returns null when there are only programs with missing begin", () =>
    expect(getTimetableBeginning([{ _id: "prog1" }])).toBeNull);

  it("returns null when there are only programs with invalid begin", () =>
    expect(getTimetableBeginning([{ begin: null }])).toBeNull);

  it("returns beginning of the only program", () =>
    expect(getTimetableBeginning([{ begin: 1748592000000 }])).toEqual(
      1748592000000,
    ));

  it("ignores invalid programs", () =>
    expect(
      getTimetableBeginning([{ begin: 1748592000000 }, { begin: null }]),
    ).toEqual(1748592000000));

  it("returns minimum from multiple programs", () =>
    expect(
      getTimetableBeginning([
        { begin: 1748592000000 },
        { begin: 1748419200000 },
        { begin: 1748937600000 },
      ]),
    ).toEqual(1748419200000));
});
