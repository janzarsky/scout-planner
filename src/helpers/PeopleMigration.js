import { addError } from "../store/errorsSlice";
import { setPeopleMigrationState } from "../store/peopleSlice";
import { updateProgram } from "../store/programsSlice";
import { level } from "./Level";

export async function migratePrograms(
  programs,
  people,
  userLevel,
  client,
  dispatch,
) {
  const programsToBeUpdated = getProgramsToBeUpdated(programs, people);

  if (programsToBeUpdated.length === 0) {
    dispatch(setPeopleMigrationState("finishedPrograms"));
    return;
  }

  if (userLevel < level.EDIT) {
    dispatch(setPeopleMigrationState("failedPrograms"));
    return;
  }

  dispatch(setPeopleMigrationState("pendingPrograms"));

  try {
    await updatePrograms(programsToBeUpdated, client, dispatch);
    dispatch(setPeopleMigrationState("finishedPrograms"));
  } catch (e) {
    dispatch(addError(e.message));
  }
}

function getProgramsToBeUpdated(programs, people) {
  return programs.flatMap((prog) => {
    const stringPeople = prog.people.filter(
      (person) => typeof person === "string",
    );

    if (stringPeople.length > 0) {
      const objectPeople = prog.people.filter(
        (person) => typeof person !== "string",
      );
      const convertedPeople = stringPeople
        .map((name) => people.find((person) => person.name === name))
        .filter((person) => person !== undefined)
        .filter((person) => !objectPeople.find((p) => p._id === person._id))
        .map((person) => ({ person: person._id }));
      return [{ ...prog, people: [...convertedPeople, ...objectPeople] }];
    }

    return [];
  });
}

async function updatePrograms(programs, client, dispatch) {
  return await Promise.all(
    programs.map((program) =>
      client.updateProgram(program).then(
        (resp) => {
          dispatch(updateProgram(resp));
          return resp._id;
        },
        (e) => dispatch(addError(e.message)),
      ),
    ),
  );
}

export const testing = {
  getProgramsToBeUpdated,
  updatePrograms,
};
