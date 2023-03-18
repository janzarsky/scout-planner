import { convertLegacyPeople } from "./PeopleConvertor";

test("empty", () => {
  expect(convertLegacyPeople([], [], [])).toEqual({
    allPeople: [],
    convertedPrograms: [],
  });
});

test("string person", () => {
  expect(convertLegacyPeople(["Person 1"], [], [])).toEqual({
    allPeople: [{ _id: "virtual_id_Person 1", name: "Person 1" }],
    convertedPrograms: [],
  });
});

test("multiple string people", () => {
  expect(convertLegacyPeople(["Person 1", "Person 2"], [], [])).toEqual({
    allPeople: [
      { _id: "virtual_id_Person 1", name: "Person 1" },
      { _id: "virtual_id_Person 2", name: "Person 2" },
    ],
    convertedPrograms: [],
  });
});

test("string and object person", () => {
  const person2 = { _id: "person2", name: "Person 2" };
  expect(convertLegacyPeople(["Person 1"], [person2], [])).toEqual({
    allPeople: [person2, { _id: "virtual_id_Person 1", name: "Person 1" }],
    convertedPrograms: [],
  });
});

test("duplicate people", () => {
  const person1 = { _id: "person1", name: "Person 1" };
  expect(convertLegacyPeople(["Person 1"], [person1], [])).toEqual({
    allPeople: [person1],
    convertedPrograms: [],
  });
});

test("object person with program", () => {
  const person1 = { _id: "person1", name: "Person 1" };
  const program1 = {
    _id: "program1",
    title: "Program 1",
    people: [{ person: "person1" }],
  };
  expect(convertLegacyPeople([], [person1], [program1])).toEqual({
    allPeople: [person1],
    convertedPrograms: [program1],
  });
});

test("string person with program", () => {
  const program1 = {
    _id: "program1",
    title: "Program 1",
    people: ["Person 1"],
  };
  expect(convertLegacyPeople(["Person 1"], [], [program1])).toEqual({
    allPeople: [{ _id: "virtual_id_Person 1", name: "Person 1" }],
    convertedPrograms: [
      {
        ...program1,
        people: [{ person: "virtual_id_Person 1" }],
      },
    ],
  });
});

test("both kinds of people with program", () => {
  const person1 = { _id: "person1", name: "Person 1" };
  const program1 = {
    _id: "program1",
    title: "Program 1",
    people: [{ person: "person1" }, "Person 2"],
  };
  expect(convertLegacyPeople(["Person 2"], [person1], [program1])).toEqual({
    allPeople: [person1, { _id: "virtual_id_Person 2", name: "Person 2" }],
    convertedPrograms: [
      {
        ...program1,
        people: [{ person: "person1" }, { person: "virtual_id_Person 2" }],
      },
    ],
  });
});
