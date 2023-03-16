import { testing } from "./Import";

var client;

const emptyData = {
  programs: [],
  pkgs: [],
  groups: [],
  rules: [],
  ranges: [],
  users: [],
  settings: {},
};

beforeEach(() => {
  const mockAddingFunction = (prefix) =>
    jest
      .fn()
      .mockImplementationOnce(async (a) => ({ ...a, _id: `${prefix}1_new` }))
      .mockImplementationOnce(async (a) => ({ ...a, _id: `${prefix}2_new` }));

  client = {
    updateSettings: jest.fn(async (a) => a),
    addProgram: mockAddingFunction("program"),
    addPackage: mockAddingFunction("pkg"),
    addGroup: mockAddingFunction("group"),
    addRange: mockAddingFunction("range"),
  };
});

test("empty data", async () => {
  return testing.importData(emptyData, client).then(() => {
    expect(client.updateSettings).toHaveBeenCalledWith({});
  });
});

test("single program", async () => {
  const data = {
    ...emptyData,
    programs: [
      {
        _id: "program1",
        table: "table1",
        title: "Program 1",
        ranges: {},
        groups: [],
        pkg: undefined,
        people: [],
      },
    ],
  };
  return testing.importData(data, client).then(() => {
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      _id: undefined,
    });
  });
});

test("program with groups", async () => {
  const data = {
    ...emptyData,
    programs: [
      {
        _id: "program1",
        table: "table1",
        title: "Program 1",
        ranges: {},
        groups: ["group1", "group2"],
        pkg: undefined,
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
  return testing.importData(data, client).then(() => {
    expect(client.addGroup).toHaveBeenCalledWith({
      ...data.groups[0],
      _id: undefined,
    });
    expect(client.addGroup).toHaveBeenCalledWith({
      ...data.groups[1],
      _id: undefined,
    });
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      _id: undefined,
      groups: ["group1_new", "group2_new"],
    });
  });
});

test("program with package", async () => {
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
  return testing.importData(data, client).then(() => {
    expect(client.addPackage).toHaveBeenCalledWith({
      ...data.pkgs[0],
      _id: undefined,
    });
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      _id: undefined,
      pkg: "pkg1_new",
    });
  });
});

test("program with ranges", async () => {
  const data = {
    ...emptyData,
    programs: [
      {
        _id: "program1",
        table: "table1",
        title: "Program 1",
        ranges: { range1: 42, range2: 23 },
        groups: [],
        pkg: undefined,
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
  return testing.importData(data, client).then(() => {
    expect(client.addRange).toHaveBeenCalledWith({
      ...data.ranges[0],
      _id: undefined,
    });
    expect(client.addRange).toHaveBeenCalledWith({
      ...data.ranges[1],
      _id: undefined,
    });
    expect(client.addProgram).toHaveBeenCalledWith({
      ...data.programs[0],
      _id: undefined,
      ranges: { range1_new: 42, range2_new: 23 },
    });
  });
});
