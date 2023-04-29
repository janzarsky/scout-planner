import { parseDuration, parseTime } from "../helpers/DateUtils";
import { getProgramRects } from "./Tray";

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
