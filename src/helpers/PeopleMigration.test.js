import { addPerson, setPeopleMigrationState } from "../store/peopleSlice";
import { updateProgram } from "../store/programsSlice";
import { level } from "./Level";
import { migratePrograms, testing } from "./PeopleMigration";

describe("migratePrograms()", () => {
  var client;
  var dispatch;

  beforeEach(() => {
    client = {
      updateProgram: vi.fn().mockImplementation(async (a) => a),
    };
    dispatch = vi.fn();
  });

  it("just updates the migration state", async () => {
    const prog1 = {
      _id: "program1",
      people: ["Person 0", "Person 1", "Person 2"],
    };
    const prog2 = {
      _id: "program2",
      people: ["Person 2", { person: "person3" }],
    };

    await migratePrograms(
      [prog1, prog2],
      [
        { _id: "person0", name: "Person 0" },
        { _id: "person1", name: "Person 1" },
        { _id: "person2", name: "Person 2" },
        { _id: "person3", name: "Person 3" },
      ],
      level.EDIT,
      client,
      dispatch,
    );

    expect(dispatch).not.toHaveBeenCalledWith(
      setPeopleMigrationState("pendingPrograms"),
    );

    expect(client.updateProgram).not.toHaveBeenCalled();

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("finishedPrograms"),
    );
  });
});

describe("getProgramsToBeUpdated()", () => {
  it("returns no programs when there are no programs", () =>
    expect(testing.getProgramsToBeUpdated([], [])).toEqual([]));

  it("does not return program with object people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const person2 = { _id: "person2", name: "Person 2" };
    const prog = {
      _id: "program1",
      people: [{ person: "person1" }, { person: "person2" }],
    };
    expect(testing.getProgramsToBeUpdated([prog], [person1, person2])).toEqual(
      [],
    );
  });

  it("returns program with converted string people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const person2 = { _id: "person2", name: "Person 2" };
    const prog = {
      _id: "program1",
      people: ["Person 1", "Person 2"],
    };
    expect(testing.getProgramsToBeUpdated([prog], [person1, person2])).toEqual([
      { ...prog, people: [{ person: "person1" }, { person: "person2" }] },
    ]);
  });

  it("removes string people that are not found in object people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const prog = {
      _id: "program1",
      people: ["Person 1", "Person 2"],
    };
    expect(testing.getProgramsToBeUpdated([prog], [person1])).toEqual([
      { ...prog, people: [{ person: "person1" }] },
    ]);
  });

  it("keeps existing object people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const person2 = { _id: "person2", name: "Person 2" };
    const prog = {
      _id: "program1",
      people: ["Person 1", { person: "person2", additional: "data" }],
    };
    expect(testing.getProgramsToBeUpdated([prog], [person1, person2])).toEqual([
      {
        ...prog,
        people: [
          { person: "person1" },
          { person: "person2", additional: "data" },
        ],
      },
    ]);
  });
});

describe("updatePrograms()", () => {
  var client;
  var dispatch;

  beforeEach(() => {
    client = {
      updateProgram: vi.fn().mockImplementation(async (a) => a),
    };
    dispatch = vi.fn();
  });

  it("returns empty promise when there are no programs", () =>
    testing.updatePrograms([], client, dispatch).then((data) => {
      expect(data).toEqual([]);
      expect(dispatch).not.toHaveBeenCalled();
      expect(client.updateProgram).not.toHaveBeenCalled();
    }));

  it("adds one program", () => {
    const prog = { _id: "program1" };
    return testing.updatePrograms([prog], client, dispatch).then((data) => {
      expect(data).toEqual(["program1"]);
      expect(client.updateProgram).toHaveBeenCalledWith(prog);
      expect(dispatch).toHaveBeenCalledWith(updateProgram(prog));
    });
  });

  it("adds two programs", () => {
    const prog1 = { _id: "program1" };
    const prog2 = { _id: "program2" };
    return testing
      .updatePrograms([prog1, prog2], client, dispatch)
      .then((data) => {
        expect(data).toEqual(["program1", "program2"]);
        expect(client.updateProgram).toHaveBeenCalledWith(prog1);
        expect(client.updateProgram).toHaveBeenCalledWith(prog2);
        expect(dispatch).toHaveBeenCalledWith(updateProgram(prog1));
        expect(dispatch).toHaveBeenCalledWith(updateProgram(prog2));
      });
  });
});
