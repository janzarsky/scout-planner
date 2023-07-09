import {
  convertLegacyPeople,
  convertProgramPeople,
  replaceLegacyPeopleInPrograms,
} from "./PeopleConvertor";

describe("convertLegacyPeople()", () => {
  it("returns empty array for empty inputs", () =>
    expect(convertLegacyPeople([], [])).toEqual([]));

  it("creates virtual person object for string person", () =>
    expect(convertLegacyPeople(["Person 1"], [])).toEqual([
      { _id: "virtual_id_Person 1", name: "Person 1" },
    ]));

  it("creates multiple virtual people objects for string people", () =>
    expect(convertLegacyPeople(["Person 1", "Person 2"], [])).toEqual([
      { _id: "virtual_id_Person 1", name: "Person 1" },
      { _id: "virtual_id_Person 2", name: "Person 2" },
    ]));

  it("combines object person and string person", () => {
    const person2 = { _id: "person2", name: "Person 2" };
    expect(convertLegacyPeople(["Person 1"], [person2])).toEqual([
      person2,
      { _id: "virtual_id_Person 1", name: "Person 1" },
    ]);
  });

  it("merges object person and string person when they have the same name", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    expect(convertLegacyPeople(["Person 1"], [person1])).toEqual([person1]);
  });
});

describe("convertProgramPeople()", () => {
  it("returns empty array for empty inputs", () =>
    expect(convertProgramPeople([], [])).toEqual([]));

  it("keeps existing object people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const programPeople = [{ person: "person1" }];
    expect(convertProgramPeople(programPeople, [person1])).toEqual(
      programPeople,
    );
  });

  it("replaces string people with references looked up using name", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    expect(convertProgramPeople(["Person 1"], [person1])).toEqual([
      { person: "person1" },
    ]);
  });

  it("replaces string people in programs with mixed people types", () => {
    expect(
      convertProgramPeople(
        [{ person: "person1" }, "Person 2"],
        [
          { _id: "person1", name: "Person 1" },
          { _id: "person2", name: "Person 2" },
        ],
      ),
    ).toEqual([{ person: "person1" }, { person: "person2" }]);
  });

  it("skips string people if not found in all people", () =>
    expect(convertProgramPeople(["Person 1"], [])).toEqual([]));
});

describe("replaceLegacyPeopleInPrograms()", () => {
  it("returns empty array for empty inputs", () =>
    expect(replaceLegacyPeopleInPrograms([], [])).toEqual([]));

  it("keeps existing object people", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const program1 = {
      _id: "program1",
      title: "Program 1",
      people: [{ person: "person1" }],
    };
    expect(replaceLegacyPeopleInPrograms([program1], [person1])).toEqual([
      program1,
    ]);
  });

  it("replaces string people with references looked up using name", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const program1 = {
      _id: "program1",
      title: "Program 1",
      people: ["Person 1"],
    };
    expect(replaceLegacyPeopleInPrograms([program1], [person1])).toEqual([
      { ...program1, people: [{ person: "person1" }] },
    ]);
  });

  it("replaces string people in programs with mixed people types", () => {
    const person1 = { _id: "person1", name: "Person 1" };
    const person2 = { _id: "person2", name: "Person 2" };
    const program1 = {
      _id: "program1",
      title: "Program 1",
      people: [{ person: "person1" }, "Person 2"],
    };
    expect(
      replaceLegacyPeopleInPrograms([program1], [person1, person2]),
    ).toEqual([
      {
        ...program1,
        people: [{ person: "person1" }, { person: "person2" }],
      },
    ]);
  });
});
