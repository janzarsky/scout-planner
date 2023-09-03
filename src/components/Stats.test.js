import { describe, expect, it } from "vitest";
import { testing } from "./Stats";

describe("getDurationPerPersonAndGroup()", () => {
  it("returns no counters if there are no people", () =>
    expect(testing.getDurationPerPersonAndGroup([], [])).toEqual({}));

  it("returns counter for a person attending one program", () => {
    const prog1 = {
      title: "Program 1",
      duration: 60,
      people: [{ person: "person1" }],
      groups: ["group1"],
    };
    expect(testing.getDurationPerPersonAndGroup([prog1], [])).toEqual({
      person1: { group1: 60 },
    });
  });

  it("skips hidden programs", () => {
    const prog1 = {
      title: "(Program 1)",
      duration: 60,
      people: [{ person: "person1" }],
      groups: ["group1"],
    };
    expect(testing.getDurationPerPersonAndGroup([prog1], [])).toEqual({});
  });

  it("skips programs that have hidden packages", () => {
    const pkg1 = {
      _id: "pkg1",
      name: "(Package 1)",
    };
    const prog1 = {
      title: "Program 1",
      duration: 60,
      people: [{ person: "person1" }],
      groups: ["group1"],
      pkg: "pkg1",
    };
    expect(testing.getDurationPerPersonAndGroup([prog1], [pkg1])).toEqual({});
  });

  it("skips programs without group", () => {
    const prog1 = {
      title: "Program 1",
      duration: 60,
      people: [{ person: "person1" }],
      groups: [],
    };
    expect(testing.getDurationPerPersonAndGroup([prog1], [])).toEqual({
      person1: {},
    });
  });

  it("returns counter for a person attending two programs in a same group", () => {
    const prog1 = {
      title: "Program 1",
      duration: 60,
      people: [{ person: "person1" }],
      groups: ["group1"],
    };
    const prog2 = {
      title: "Program 2",
      duration: 90,
      people: [{ person: "person1" }],
      groups: ["group1"],
    };
    expect(testing.getDurationPerPersonAndGroup([prog1, prog2], [])).toEqual({
      person1: { group1: 150 },
    });
  });

  it("returns counter for a person attending two programs in different groups", () => {
    const prog1 = {
      title: "Program 1",
      duration: 60,
      people: [{ person: "person1" }],
      groups: ["group1"],
    };
    const prog2 = {
      title: "Program 2",
      duration: 90,
      people: [{ person: "person1" }],
      groups: ["group2"],
    };
    expect(testing.getDurationPerPersonAndGroup([prog1, prog2], [])).toEqual({
      person1: { group1: 60, group2: 90 },
    });
  });
});
