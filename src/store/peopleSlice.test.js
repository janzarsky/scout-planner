import reducer, { addPerson, deletePerson, updatePerson } from "./peopleSlice";

test("initial state", () => {
  expect(reducer(undefined, { type: undefined })).toMatchObject({
    people: [],
    loading: "idle",
    error: null,
    loaded: false,
  });
});

const testPerson1 = { _id: "testperson1", name: "Alice" };
const testPerson2 = { _id: "testperson2", name: "Bob" };

test("add person", () => {
  expect(reducer({ people: [] }, addPerson(testPerson1))).toEqual({
    people: [testPerson1],
  });
});

test("add second person", () => {
  expect(reducer({ people: [testPerson1] }, addPerson(testPerson2))).toEqual({
    people: [testPerson1, testPerson2],
  });
});

test("delete person", () => {
  expect(
    reducer(
      { people: [testPerson1, testPerson2] },
      deletePerson(testPerson1._id),
    ),
  ).toEqual({
    people: [testPerson2],
  });
});

test("update person", () => {
  const updatedPerson1 = { _id: testPerson1._id, name: "Cecil" };
  expect(
    reducer(
      { people: [testPerson1, testPerson2] },
      updatePerson(updatedPerson1),
    ),
  ).toEqual({
    people: [testPerson2, updatedPerson1],
  });
});

// TODO: write tests for loadPeople
