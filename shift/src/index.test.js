import { describe, expect, it } from "vitest";
import { testing } from ".";

const { getOptions, loadData } = testing;

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
