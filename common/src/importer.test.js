import { beforeEach, describe, expect, it, vi } from "vitest";
import { level } from "./level";
import { importData, testing } from "./importer";

describe("importer", () => {
  var client;

  const emptyData = {
    programs: [],
    pkgs: [],
    groups: [],
    rules: [],
    ranges: [],
    users: [],
    people: [],
    settings: {},
  };

  beforeEach(() => {
    const mockAddingFunction = (prefix) =>
      vi
        .fn()
        .mockImplementationOnce(async (a) => ({ ...a, _id: `${prefix}1_new` }))
        .mockImplementationOnce(async (a) => ({ ...a, _id: `${prefix}2_new` }));

    client = {
      updateTimetable: vi.fn(),
      addProgram: mockAddingFunction("program"),
      addPackage: mockAddingFunction("pkg"),
      addGroup: mockAddingFunction("group"),
      addRange: mockAddingFunction("range"),
      addPerson: mockAddingFunction("person"),
      addUser: mockAddingFunction("user"),
      updateUser: vi.fn().mockImplementation(async (a) => a),
      setPublicLevel: vi.fn().mockImplementation(async (a) => a),
    };
  });

  it("imports empty timetable", async () => {
    await importData(emptyData, client);

    expect(client.updateTimetable).toHaveBeenCalledWith({ settings: {} });
  });

  it("imports single program", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: [],
          pkg: null,
          people: [],
        },
      ],
    };

    await importData(data, client);

    expect(client.addProgram).toHaveBeenCalledWith(data.programs[0]);
  });

  it("imports program with groups", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: ["group1", "group2"],
          pkg: null,
          people: [],
        },
      ],
      groups: [
        {
          _id: "group1",
          table: "table1",
          name: "Group 1",
        },
        {
          _id: "group2",
          table: "table1",
          name: "Group 2",
        },
      ],
    };

    await importData(data, client);

    expect(client.addGroup).toHaveBeenCalledWith(data.groups[0]);
    expect(client.addGroup).toHaveBeenCalledWith(data.groups[1]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      groups: ["group1_new", "group2_new"],
    });
  });

  it("imports program with package", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: [],
          pkg: "pkg1",
          people: [],
        },
      ],
      pkgs: [
        {
          _id: "pkg1",
          table: "table1",
          name: "Test package",
          color: "#ffffff",
        },
      ],
    };

    await importData(data, client);

    expect(client.addPackage).toHaveBeenCalledWith(data.pkgs[0]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      pkg: "pkg1_new",
    });
  });

  it("imports program with ranges", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: { range1: 42, range2: 23 },
          groups: [],
          pkg: null,
          people: [],
        },
      ],
      ranges: [
        {
          _id: "range1",
          table: "table1",
          name: "Range 1",
        },
        {
          _id: "range2",
          table: "table1",
          name: "Range 2",
        },
      ],
    };

    await importData(data, client);

    expect(client.addRange).toHaveBeenCalledWith(data.ranges[0]);
    expect(client.addRange).toHaveBeenCalledWith(data.ranges[1]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      ranges: { range1_new: 42, range2_new: 23 },
    });
  });

  it("imports program with object people", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: [],
          pkg: null,
          people: [{ person: "person1" }, { person: "person2" }],
        },
      ],
      people: [
        {
          _id: "person1",
          table: "table1",
          name: "Person 1",
        },
        {
          _id: "person2",
          table: "table1",
          name: "Person 2",
        },
      ],
    };

    await importData(data, client);

    expect(client.addPerson).toHaveBeenCalledWith(data.people[0]);
    expect(client.addPerson).toHaveBeenCalledWith(data.people[1]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      people: [{ person: "person1_new" }, { person: "person2_new" }],
    });
  });

  it("imports program with string people", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: [],
          pkg: null,
          people: ["Person 1", "Person 2"],
        },
      ],
      people: [
        {
          _id: "person1",
          table: "table1",
          name: "Person 1",
        },
        {
          _id: "person2",
          table: "table1",
          name: "Person 2",
        },
      ],
    };

    await importData(data, client);

    expect(client.addPerson).toHaveBeenCalledWith(data.people[0]);
    expect(client.addPerson).toHaveBeenCalledWith(data.people[1]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      people: ["Person 1", "Person 2"],
    });
  });

  it("imports program with mixed people", async () => {
    const data = {
      ...emptyData,
      programs: [
        {
          _id: "program1",
          table: "table1",
          title: "Program 1",
          ranges: {},
          groups: [],
          pkg: null,
          people: [{ person: "person1" }, "Person 2"],
        },
      ],
      people: [
        {
          _id: "person1",
          table: "table1",
          name: "Person 1",
        },
      ],
    };

    await importData(data, client);

    expect(client.addPerson).toHaveBeenCalledWith(data.people[0]);
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      people: [{ person: "person1_new" }, "Person 2"],
    });
  });

  describe("imports users", () => {
    it("imports one user", async () => {
      const data = {
        ...emptyData,
        users: [{ _id: "user0", email: "test@user.com", level: level.ADMIN }],
      };

      await importData(data, client);

      expect(client.updateUser).toHaveBeenCalledWith({
        ...data.users[0],
        _id: "test@user.com",
      });
    });

    it("sets public user", async () => {
      const data = {
        ...emptyData,
        users: [{ _id: "public", email: "public", level: level.ADMIN }],
      };

      await importData(data, client);

      expect(client.setPublicLevel).toHaveBeenCalledWith(level.ADMIN);
    });

    it("imports both real and public users", async () => {
      const data = {
        ...emptyData,
        users: [
          { _id: "public", email: "public", level: level.ADMIN },
          { _id: "user0", email: "test@user.com", level: level.ADMIN },
          { _id: "user1", email: "another@user.com", level: level.EDIT },
        ],
      };

      await importData(data, client);

      expect(client.setPublicLevel).toHaveBeenCalledWith(level.ADMIN);
      expect(client.updateUser).toHaveBeenCalledWith({
        ...data.users[1],
        _id: data.users[1].email,
      });
      expect(client.updateUser).toHaveBeenCalledWith({
        ...data.users[2],
        _id: data.users[2].email,
      });
    });
  });
});

describe("rules ID replacement", () => {
  it("returns nothing when there are no rules and IDs", () =>
    expect(testing.replaceIdsInRules([], new Map())).toEqual([]));

  it("returns nothing when there are no rules", () =>
    expect(
      testing.replaceIdsInRules([], new Map([["prog1", "prog2"]])),
    ).toEqual([]));

  ["is_before_date", "is_after_date"].forEach((ruleName) => {
    it(`replaces program ID in a ${ruleName} rule`, () => {
      const rule = {
        program: "prog1",
        condition: ruleName,
        value: 1692639300000,
      };

      expect(
        testing.replaceIdsInRules([rule], new Map([["prog1", "prog2"]])),
      ).toEqual([
        {
          ...rule,
          program: "prog2",
        },
      ]);
    });
  });

  ["is_before_program", "is_after_program"].forEach((ruleName) => {
    it(`replaces both program IDs in a ${ruleName} rule`, () => {
      const rule = {
        program: "prog1",
        condition: ruleName,
        value: "prog2",
      };
      const map = new Map([
        ["prog1", "newProg1"],
        ["prog2", "newProg2"],
      ]);

      expect(testing.replaceIdsInRules([rule], map)).toEqual([
        {
          ...rule,
          program: "newProg1",
          value: "newProg2",
        },
      ]);
    });
  });

  it("replaces program IDs in multiple rules", () => {
    const rules = [
      {
        program: "prog1",
        condition: "is_before_date",
        value: 1692639300000,
      },
      {
        program: "prog1",
        condition: "is_after_program",
        value: "prog2",
      },
    ];
    const map = new Map([
      ["prog1", "newProg1"],
      ["prog2", "newProg2"],
    ]);

    expect(testing.replaceIdsInRules(rules, map)).toEqual([
      {
        ...rules[0],
        program: "newProg1",
      },
      {
        ...rules[1],
        program: "newProg1",
        value: "newProg2",
      },
    ]);
  });

  it("discards rules with broken program", () => {
    const rule = {
      program: "prog1",
      condition: "is_before_date",
      value: 1692639300000,
    };

    expect(testing.replaceIdsInRules([rule], new Map())).toEqual([]);
  });

  it("discards rules with broken value field", () => {
    const rule = {
      program: "prog1",
      condition: "is_before_program",
      value: "prog2",
    };

    expect(
      testing.replaceIdsInRules([rule], new Map([["prog1", "prog2"]])),
    ).toEqual([]);
  });

  it("keeps other properties", () => {
    const rule = {
      _id: "rule1",
      program: "prog1",
      condition: "is_before_date",
      value: 1692639300000,
    };

    expect(
      testing.replaceIdsInRules([rule], new Map([["prog1", "prog2"]])),
    ).toEqual([
      {
        ...rule,
        program: "prog2",
      },
    ]);
  });
});
