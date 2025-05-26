import { describe, expect, it } from "vitest";
import { testing } from ".";

const { getOptions, loadData, shiftPrograms, shiftRules, shiftPeople } =
  testing;

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

describe("shift rules", () => {
  it("accepts empty array", () => expect(shiftRules([], 42)).toEqual([]));

  it("ignores rules without time and date", () => {
    const r1 = {
      _id: "rule1",
      condition: "is_after_program",
      program: "prog1",
      value: "prog2",
    };
    const r2 = {
      _id: "rule2",
      condition: "is_before_program",
      program: "prog2",
      value: "prog3",
    };
    expect(shiftRules([r1, r2], 86400)).toEqual([]);
  });

  it("shifts values by offset", () => {
    const r1 = {
      _id: "rule1",
      condition: "is_after_date",
      program: "prog1",
      value: 1748113600,
    };
    const r2 = {
      _id: "rule2",
      condition: "is_before_date",
      program: "prog2",
      value: 1748286400,
    };
    expect(shiftRules([r1, r2], 86400)).toEqual([
      { _id: "rule1", value: 1748200000 },
      { _id: "rule2", value: 1748372800 },
    ]);
  });

  it("ignores rules with value that is not numeric", () => {
    const r = {
      _id: "rule1",
      condition: "is_after_date",
      program: "prog1",
      value: "x",
    };
    expect(shiftRules([r], 86400)).toEqual([]);
  });
});

describe("shift people attendance", () => {
  it("accepts empty array", () => expect(shiftPeople([], 42)).toEqual([]));

  it("ignores people without absence (undefined)", () =>
    expect(shiftPeople([{ _id: "person1" }], 42)).toEqual([]));

  it("ignores people without absence (empty)", () =>
    expect(shiftPeople([{ _id: "person1", absence: [] }], 42)).toEqual([]));

  it("shifts absence by offset", () => {
    const p = {
      _id: "person1",
      absence: [{ begin: 1748200000, end: 1748372800 }],
    };
    expect(shiftPeople([p], 86400)).toEqual([
      {
        _id: "person1",
        absence: [{ begin: 1748286400, end: 1748459200 }],
      },
    ]);
  });

  it("deletes invalid absence entries", () => {
    // the whole absence array will be updated at once, so we should do a data
    // cleanup here
    const p = {
      _id: "person1",
      absence: [
        { begin: 1748200000, end: "x" },
        { begin: "x", end: 1748372800 },
      ],
    };
    expect(shiftPeople([p], 86400)).toEqual([{ _id: "person1", absence: [] }]);
  });

  it("returns just ID and absence properties", () => {
    const p = {
      _id: "person1",
      absence: [{ begin: 1748200000, end: 1748372800 }],
      extra: "property",
    };
    expect(shiftPeople([p], 86400)).toEqual([
      { _id: "person1", absence: [{ begin: 1748286400, end: 1748459200 }] },
    ]);
  });
});
