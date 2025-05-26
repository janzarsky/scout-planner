import { describe, expect, it } from "vitest";
import { testing } from ".";

const { getOptions, loadData, shiftPrograms } = testing;

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

describe("load data", () => {
  it("loads programs, rules, and people", async () => {
    const client = {
      getPrograms: async () => [{ _id: "prog1" }],
      getRules: async () => [{ _id: "rule1" }],
      getPeople: async () => [{ _id: "person1" }],
    };
    const res = await loadData(client);
    expect(res).toHaveProperty("programs", [{ _id: "prog1" }]);
    expect(res).toHaveProperty("rules", [{ _id: "rule1" }]);
    expect(res).toHaveProperty("people", [{ _id: "person1" }]);
  });

  it("throws on error", async () => {
    const client = {
      getPrograms: async () => [{ _id: "prog1" }],
      getRules: async () => [{ _id: "rule1" }],
      getPeople: async () => {
        throw new Error("Something went wrong");
      },
    };
    await expect(loadData(client)).rejects.toThrow("Something went wrong");
  });
});

describe("shift programs", () => {
  it("accepts empty array", () => expect(shiftPrograms([], 42)).toEqual([]));

  it("adds offset to the begin property", () =>
    expect(shiftPrograms([{ _id: "prog1", begin: 1748200000 }], 86400)).toEqual(
      [{ _id: "prog1", begin: 1748286400 }],
    ));

  it("adds negative offset to the begin property", () =>
    expect(
      shiftPrograms([{ _id: "prog1", begin: 1748200000 }], -86400),
    ).toEqual([{ _id: "prog1", begin: 1748113600 }]));

  it("ignores programs without begin property", () =>
    expect(shiftPrograms([{ _id: "prog1" }], 86400)).toEqual([]));

  it("ignores programs with begin property that is not numeric", () =>
    expect(shiftPrograms([{ _id: "prog1", begin: "x" }], 86400)).toEqual([]));

  it("returns just ID and begin properties", () =>
    expect(
      shiftPrograms(
        [{ _id: "prog1", begin: 1748200000, extra: "property" }],
        86400,
      ),
    ).toEqual([{ _id: "prog1", begin: 1748286400 }]));
});
