import { describe, expect, it } from "vitest";
import { testing } from ".";

const { getOptions } = testing;

describe("get options", () => {
  it("throws error when no parameters", () => {
    expect(() => getOptions({ query: {} })).toThrow("Invalid parameters");
  });

  it("throws error when no offset", () => {
    expect(() => getOptions({ query: { source: "timetable1" } })).toThrow(
      "Invalid parameters",
    );
  });

  it("throws error when offset is not a number", () => {
    expect(() =>
      getOptions({ query: { source: "timetable1", offset: "asdf" } }),
    ).toThrow("Invalid parameters");
  });

  it("throws error when source is too short", () => {
    expect(() =>
      getOptions({ query: { source: "a", offset: "asdf" } }),
    ).toThrow("Invalid parameters");
  });

  it("throws error when source contains invalid characters", () => {
    expect(() =>
      getOptions({ query: { source: "abc#$%", offset: "asdf" } }),
    ).toThrow("Invalid parameters");
  });

  it("returns source and offset", () => {
    expect(
      getOptions({
        query: { source: "timetable1", offset: "86400" },
      }),
    ).toEqual({ source: "timetable1", offset: 86400 });
  });
});
