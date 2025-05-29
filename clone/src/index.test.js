import { describe, it, expect } from "vitest";
import { testing } from ".";

describe("get options", () => {
  it("throws error when no parameters", () => {
    expect(() => testing.getOptions({ query: {} })).toThrow(
      "Invalid parameters",
    );
  });

  it("throws error when no destination", () => {
    expect(() =>
      testing.getOptions({ query: { source: "timetable1" } }),
    ).toThrow("Invalid parameters");
  });

  it("returns source and destination", () => {
    expect(
      testing.getOptions({
        query: { source: "timetable1", destination: "timetable2" },
      }),
    ).toEqual({ source: "timetable1", destination: "timetable2" });
  });
});
