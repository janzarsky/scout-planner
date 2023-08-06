import { addError } from "../store/errorsSlice";
import { updateProgram } from "../store/programsSlice";

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
