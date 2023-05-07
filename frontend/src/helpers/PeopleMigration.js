import { addError } from "../store/errorsSlice";
import { addPerson, setPeopleMigrationState } from "../store/peopleSlice";

export async function migratePeople(programs, people, client, dispatch) {
  const legacyPeople = getLegacyPeople(programs);
  const peopleToAdd = getPeopleToBeAdded(legacyPeople, people);

  dispatch(setPeopleMigrationState("pending"));

  try {
    await addMissingPeople(peopleToAdd, client, dispatch);
    dispatch(setPeopleMigrationState("peopleAdded"));
  } catch (e) {
    dispatch(addError(e.message));
  }
}

async function addMissingPeople(peopleToAdd, client, dispatch) {
  return await Promise.all(
    peopleToAdd.map((person) =>
      client.addPerson(person).then(
        (resp) => {
          dispatch(addPerson(resp));
          return resp._id;
        },
        (e) => dispatch(addError(e.message))
      )
    )
  );
}

function getLegacyPeople(programs) {
  return [
    ...new Set(
      programs.flatMap((prog) =>
        prog.people.filter((person) => typeof person === "string")
      )
    ),
  ];
}

function getPeopleToBeAdded(legacyPeople, existingPeople) {
  return legacyPeople
    .filter((person) => !existingPeople.find((p) => p.name === person))
    .map((name) => ({ name }));
}

export const testing = {
  addMissingPeople,
  getLegacyPeople,
  getPeopleToBeAdded,
};
