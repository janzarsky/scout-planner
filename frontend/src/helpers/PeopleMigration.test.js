import { addPerson, setPeopleMigrationState } from "../store/peopleSlice";
import { updateProgram } from "../store/programsSlice";
import { level } from "./Level";
import { migratePeople, migratePrograms, testing } from "./PeopleMigration";

describe("migratePeople()", () => {
  var client;
  var dispatch;

  beforeEach(() => {
    client = {
      addPerson: jest
        .fn()
        .mockImplementationOnce(async (a) => ({ ...a, _id: `person1_new` }))
        .mockImplementationOnce(async (a) => ({ ...a, _id: `person2_new` })),
    };
    dispatch = jest.fn();
  });

  it("updates migration state and adds new people", () => {
    const prog1 = {
      _id: "program1",
      people: ["Person 0", "Person 1", "Person 2"],
    };
    const prog2 = {
      _id: "program2",
      people: ["Person 2", { person: "person3" }],
    };

    return migratePeople(
      [prog1, prog2],
      [{ _id: "person0", name: "Person 0" }],
      level.EDIT,
      client,
      dispatch
    ).then(() => {
      expect(dispatch).toHaveBeenCalledWith(
        setPeopleMigrationState("pendingPeople")
      );

      expect(client.addPerson).not.toHaveBeenCalledWith({ name: "Person 0" });
      expect(client.addPerson).toHaveBeenCalledWith({ name: "Person 1" });
      expect(client.addPerson).toHaveBeenCalledWith({ name: "Person 2" });
      expect(client.addPerson).not.toHaveBeenCalledWith({ name: "Person 3" });

      expect(dispatch).toHaveBeenCalledWith(
        addPerson({ _id: "person1_new", name: "Person 1" })
      );
      expect(dispatch).toHaveBeenCalledWith(
        addPerson({ _id: "person2_new", name: "Person 2" })
      );

      expect(dispatch).toHaveBeenCalledWith(
        setPeopleMigrationState("finishedPeople")
      );
    });
  });

  it("skips migration when the user level is not sufficient and there are people to be migrated", async () => {
    const prog1 = { _id: "program1", people: ["Person 1"] };

    await migratePeople([prog1], [], level.VIEW, client, dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("failedPeople")
    );
  });

  it("finishes migration when the user level is not sufficient but there are no people to be migrated", async () => {
    const prog1 = { _id: "program1", people: [] };

    await migratePeople([prog1], [], level.VIEW, client, dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("finishedPeople")
    );
  });
});

describe("addMissingPeople()", () => {
  var client;
  var dispatch;

  beforeEach(() => {
    client = {
      addPerson: jest
        .fn()
        .mockImplementationOnce(async (a) => ({ ...a, _id: `person1_new` }))
        .mockImplementationOnce(async (a) => ({ ...a, _id: `person2_new` })),
    };
    dispatch = jest.fn();
  });

  it("returns empty promise when there are no people", () =>
    testing.addMissingPeople([], client, dispatch).then((data) => {
      expect(data).toEqual([]);
      expect(dispatch).not.toHaveBeenCalled();
      expect(client.addPerson).not.toHaveBeenCalled();
    }));

  it("adds one person", () =>
    testing
      .addMissingPeople([{ name: "Person 1" }], client, dispatch)
      .then((data) => {
        expect(data).toEqual(["person1_new"]);
        expect(client.addPerson).toHaveBeenCalledWith({ name: "Person 1" });
        expect(dispatch).toHaveBeenCalledWith(
          addPerson({ _id: "person1_new", name: "Person 1" })
        );
      }));

  it("adds two people", () =>
    testing
      .addMissingPeople(
        [{ name: "Person 1" }, { name: "Person 2" }],
        client,
        dispatch
      )
      .then((data) => {
        expect(data).toEqual(["person1_new", "person2_new"]);
        expect(client.addPerson).toHaveBeenCalledWith({ name: "Person 1" });
        expect(client.addPerson).toHaveBeenCalledWith({ name: "Person 2" });
        expect(dispatch).toHaveBeenCalledWith(
          addPerson({ _id: "person1_new", name: "Person 1" })
        );
        expect(dispatch).toHaveBeenCalledWith(
          addPerson({ _id: "person2_new", name: "Person 2" })
        );
      }));
});

describe("getLegacyPeople()", () => {
  it("returns nothing when there are object people in programs", () => {
    const prog = {
      _id: "program1",
      people: [{ person: "person1" }],
    };
    expect(testing.getLegacyPeople([prog])).toEqual([]);
  });

  it("returns new person when there is string person in a program", () => {
    const prog = {
      _id: "program1",
      people: ["Person 1"],
    };
    expect(testing.getLegacyPeople([prog])).toEqual(["Person 1"]);
  });

  it("returns new people from multiple programs", () => {
    const prog1 = {
      _id: "program1",
      people: ["Person 1", "Person 2"],
    };
    const prog2 = {
      _id: "program2",
      people: ["Person 3", "Person 4"],
    };
    expect(testing.getLegacyPeople([prog1, prog2])).toEqual([
      "Person 1",
      "Person 2",
      "Person 3",
      "Person 4",
    ]);
  });

  it("removes duplicates", () => {
    const prog1 = {
      _id: "program1",
      people: ["Person 1", "Person 2"],
    };
    const prog2 = {
      _id: "program2",
      people: ["Person 2", "Person 3"],
    };
    expect(testing.getLegacyPeople([prog1, prog2])).toEqual([
      "Person 1",
      "Person 2",
      "Person 3",
    ]);
  });
});

describe("getPeopleToBeAdded()", () => {
  it("returns empty array when there are no legacy people", () =>
    expect(testing.getPeopleToBeAdded([], [])).toEqual([]));

  it("returns new person when there are no existing people", () =>
    expect(testing.getPeopleToBeAdded(["Person 1"], [])).toEqual([
      { name: "Person 1" },
    ]));

  it("returns new person when the person is not in existing people", () =>
    expect(
      testing.getPeopleToBeAdded(
        ["Person 1"],
        [{ _id: "person2", name: "Person 2" }]
      )
    ).toEqual([{ name: "Person 1" }]));

  it("does not return new person when the person is in existing people", () =>
    expect(
      testing.getPeopleToBeAdded(
        ["Person 1"],
        [{ _id: "person1", name: "Person 1" }]
      )
    ).toEqual([]));
});

describe("migratePrograms()", () => {
  var client;
  var dispatch;

  beforeEach(() => {
    client = {
      updateProgram: jest.fn().mockImplementation(async (a) => a),
    };
    dispatch = jest.fn();
  });

  it("updates migration state and updates two programs", async () => {
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
      dispatch
    );

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("pendingPrograms")
    );

    expect(client.updateProgram).toHaveBeenCalledWith({
      ...prog1,
      people: [
        { person: "person0" },
        { person: "person1" },
        { person: "person2" },
      ],
    });
    expect(client.updateProgram).toHaveBeenCalledWith({
      ...prog2,
      people: [{ person: "person2" }, { person: "person3" }],
    });

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("finishedPrograms")
    );
  });

  it("skips migration when the user level is not sufficient and there are programs to be updated", async () => {
    const prog1 = { _id: "program1", people: ["Person 1"] };

    await migratePrograms(
      [prog1],
      [{ _id: "person1", name: "Person 1" }],
      level.VIEW,
      client,
      dispatch
    );

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("failedPrograms")
    );
  });

  it("finishes migration when the user level is not sufficient but there are no programs to be updated", async () => {
    const prog1 = { _id: "program1", people: [] };

    await migratePrograms([prog1], [], level.VIEW, client, dispatch);

    expect(dispatch).toHaveBeenCalledWith(
      setPeopleMigrationState("finishedPrograms")
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
      []
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
      updateProgram: jest.fn().mockImplementation(async (a) => a),
    };
    dispatch = jest.fn();
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
