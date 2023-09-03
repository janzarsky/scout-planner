import { describe, expect, it } from "vitest";
import { parseDuration, parseTime } from "./DateUtils";
import { getProgramRects, sortTrayPrograms } from "./TrayUtils";

describe("getProgramRects", () => {
  const settings = {
    dayStart: parseTime("7:00"),
    dayEnd: parseTime("22:00"),
    timeStep: parseDuration("0:15"),
  };

  it("should return empty array for no programs", () => {
    expect(getProgramRects([], settings)).toEqual([]);
  });

  it("should position one program at the top left corner", () => {
    const prog = { duration: parseDuration("1:00") };

    expect(getProgramRects([prog], settings)).toEqual([
      [prog, { x: 4, y: 0, width: 4, height: 1 }],
    ]);
  });

  it("should remove the space for add button when not requested", () => {
    const prog = { duration: parseDuration("1:00") };

    expect(getProgramRects([prog], settings, false)).toEqual([
      [prog, { x: 0, y: 0, width: 4, height: 1 }],
    ]);
  });

  it("should position two programs next to each other", () => {
    const prog1 = { duration: parseDuration("1:00") };
    const prog2 = { duration: parseDuration("1:00") };

    expect(getProgramRects([prog1, prog2], settings)).toEqual([
      [prog1, { x: 4, y: 0, width: 4, height: 1 }],
      [prog2, { x: 8, y: 0, width: 4, height: 1 }],
    ]);
  });

  it("should position overlapping program on the next row", () => {
    const prog1 = { duration: parseDuration("10:00") };
    const prog2 = { duration: parseDuration("10:00") };

    expect(getProgramRects([prog1, prog2], settings)).toEqual([
      [prog1, { x: 4, y: 0, width: 40, height: 1 }],
      [prog2, { x: 0, y: 1, width: 40, height: 1 }],
    ]);
  });

  it("should position third program after overlapping program", () => {
    const prog1 = { duration: parseDuration("10:00") };
    const prog2 = { duration: parseDuration("5:00") };
    const prog3 = { duration: parseDuration("5:00") };

    expect(getProgramRects([prog1, prog2, prog3], settings)).toEqual([
      [prog1, { x: 4, y: 0, width: 40, height: 1 }],
      [prog2, { x: 0, y: 1, width: 20, height: 1 }],
      [prog3, { x: 20, y: 1, width: 20, height: 1 }],
    ]);
  });
});

describe("sortTrayPrograms", () => {
  it("should return empty array for no programs", () =>
    expect(sortTrayPrograms([], [])).toEqual([]));

  it("should return one program", () => {
    const prog = { title: "Prog A" };
    expect(sortTrayPrograms([prog], [])).toEqual([prog]);
  });

  it("should sort two programs by title", () => {
    const progA = { title: "Prog A" };
    const progB = { title: "Prog B" };
    expect(sortTrayPrograms([progB, progA], [])).toEqual([progA, progB]);
  });

  it("should sort two programs by package name", () => {
    const pkgA = { _id: "pkgA", name: "Package A" };
    const pkgB = { _id: "pkgB", name: "Package B" };
    const progA = { title: "Prog A", pkg: pkgB._id };
    const progB = { title: "Prog B", pkg: pkgA._id };
    expect(sortTrayPrograms([progA, progB], [pkgB, pkgA])).toEqual([
      progB,
      progA,
    ]);
  });

  it("should sort two programs by title when their package is the same ", () => {
    const pkg = { _id: "pkg", name: "Package" };
    const progA = { title: "Prog A", pkg: pkg._id };
    const progB = { title: "Prog B", pkg: pkg._id };
    expect(sortTrayPrograms([progB, progA], [pkg])).toEqual([progA, progB]);
  });
});
