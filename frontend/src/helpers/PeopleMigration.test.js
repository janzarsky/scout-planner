import { addPerson, setPeopleMigrationState } from "../store/peopleSlice";
import { migratePeople, testing } from "./PeopleMigration";

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
      client,
      dispatch
    ).then(() => {
      expect(dispatch).toHaveBeenCalledWith(setPeopleMigrationState("pending"));

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
        setPeopleMigrationState("peopleAdded")
      );
    });
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
