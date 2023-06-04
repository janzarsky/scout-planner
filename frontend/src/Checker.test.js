import { checkRules } from "./Checker";

test("empty", () => {
  expect(checkRules([], [])).toEqual({ violations: new Map(), other: [] });
});

describe("overlaps", () => {
  test("two programs with non-overlapping time", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 90, duration: 60, groups: ["first"] };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two programs with different groups", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"], people: [] };
    const progB = { begin: 0, duration: 60, groups: ["second"], people: [] };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two programs with overlapping time and equal group", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      groups: ["first"],
      people: [],
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      groups: ["first"],
      people: [],
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [
        { program: "progA", msg: "Více programů pro jednu skupinu" },
        { program: "progB", msg: "Více programů pro jednu skupinu" },
      ],
    });
  });

  test("two programs with overlapping time, equal group, but different block order", () => {
    const progA = {
      begin: 0,
      duration: 60,
      groups: ["first"],
      people: [],
      blockOrder: 0,
    };
    const progB = {
      begin: 30,
      duration: 60,
      groups: ["first"],
      people: [],
      blockOrder: 1,
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two programs with overlapping time and equal groups", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      groups: ["first", "second"],
      people: [],
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      groups: ["first", "second"],
      people: [],
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [
        { program: "progA", msg: "Více programů pro jednu skupinu" },
        { program: "progB", msg: "Více programů pro jednu skupinu" },
      ],
    });
  });

  test("two programs with overlapping time, equal groups, but different block order", () => {
    const progA = {
      begin: 0,
      duration: 60,
      groups: ["first", "second"],
      people: [],
      blockOrder: 0,
    };
    const progB = {
      begin: 30,
      duration: 60,
      groups: ["first", "second"],
      people: [],
      blockOrder: 1,
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two programs right after each other", () => {
    const progA = { begin: 0, duration: 60, groups: ["first"] };
    const progB = { begin: 60, duration: 60, groups: ["first"] };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two programs with overlapping times and groups", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      groups: ["first", "second"],
      people: [],
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      groups: ["second", "third"],
      people: [],
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [
        { program: "progA", msg: "Více programů pro jednu skupinu" },
        { program: "progB", msg: "Více programů pro jednu skupinu" },
      ],
    });
  });

  test("two programs with overlapping times and groups but with different block order", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      groups: ["first", "second"],
      people: [],
      blockOrder: 0,
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      groups: ["second", "third"],
      people: [],
      blockOrder: 1,
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [
        { program: "progA", msg: "Více programů pro jednu skupinu" },
        { program: "progB", msg: "Více programů pro jednu skupinu" },
      ],
    });
  });

  test("two programs with overlapping times, different block order, but no groups", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      groups: [],
      people: [],
      blockOrder: 0,
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      groups: [],
      people: [],
      blockOrder: 1,
    };

    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });
});

describe("people", () => {
  test("two non-overlapping programs", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      people: [{ person: "person1" }, { person: "person2" }],
    };
    const progB = {
      _id: "progB",
      begin: 90,
      duration: 60,
      people: [{ person: "person2" }, { person: "person3" }],
    };
    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  test("two overlapping programs", () => {
    const progA = {
      _id: "progA",
      begin: 0,
      duration: 60,
      people: [{ person: "person1" }, { person: "person2" }],
      groups: ["groupA"],
    };
    const progB = {
      _id: "progB",
      begin: 30,
      duration: 60,
      people: [{ person: "person2" }, { person: "person3" }],
      groups: ["groupB"],
    };
    expect(checkRules([], [progA, progB])).toEqual({
      violations: new Map(),
      other: [
        { program: "progA", people: ["person2"] },
        { program: "progB", people: ["person2"] },
      ],
    });
  });
});

describe("Absence", () => {
  it("shows no error when the absence is empty", () => {
    const prog = {
      _id: "prog1",
      begin: 0,
      duration: 60,
      people: [{ person: "person1" }],
    };
    const person = { _id: "person1", name: "Person 1", absence: [] };
    expect(checkRules([], [prog], [person])).toEqual({
      violations: new Map(),
      other: [],
    });
  });

  it("shows violation if the person is absent", () => {
    const prog = {
      _id: "prog1",
      begin: 30,
      duration: 60,
      people: [{ person: "person1" }],
    };
    const person = {
      _id: "person1",
      name: "Person 1",
      absence: [{ begin: 0, end: 120 }],
    };
    expect(checkRules([], [prog], [person])).toEqual({
      violations: new Map(),
      other: [{ program: "prog1", people: ["person1"] }],
    });
  });

  it("shows violation if the person is absent with multiple entries", () => {
    const prog = {
      _id: "prog1",
      begin: 30,
      duration: 60,
      people: [{ person: "person1" }],
    };
    const person = {
      _id: "person1",
      name: "Person 1",
      absence: [
        { begin: 0, end: 10 },
        { begin: 20, end: 40 },
      ],
    };
    expect(checkRules([], [prog], [person])).toEqual({
      violations: new Map(),
      other: [{ program: "prog1", people: ["person1"] }],
    });
  });

  it("does not show violation if the person returns just before the program", () => {
    const prog = {
      _id: "prog1",
      begin: 10,
      duration: 60,
      people: [{ person: "person1" }],
    };
    const person = {
      _id: "person1",
      name: "Person 1",
      absence: [{ begin: 0, end: 10 }],
    };
    expect(checkRules([], [prog], [person])).toEqual({
      violations: new Map(),
      other: [],
    });
  });
});
