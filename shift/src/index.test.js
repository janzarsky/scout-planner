import { describe, expect, it } from "vitest";
import { testing } from ".";

const { getOptions } = testing;

describe("get options", () => {
  it("throws error when no parameters", () => {
    expect(() => getOptions({ query: {} })).toThrow("Invalid parameters");
  });

  it("throws error when no offset", () => {
    expect(() => getOptions({ query: { table: "timetable1" } })).toThrow(
      "Invalid parameters",
    );
  });

  it("throws error when offset is not a number", () => {
    expect(() =>
      getOptions({ query: { table: "timetable1", offset: "asdf" } }),
    ).toThrow("Invalid parameters");
  });

  it("throws error when table is invalid", () => {
    expect(() =>
      getOptions({ query: { table: "abc#$%", offset: "asdf" } }),
    ).toThrow("Invalid parameters");
  });

  it("returns table and offset", () => {
    expect(
      getOptions({
        query: { table: "timetable1", offset: "86400" },
      }),
    ).toEqual({ table: "timetable1", offset: 86400 });
  });
});
