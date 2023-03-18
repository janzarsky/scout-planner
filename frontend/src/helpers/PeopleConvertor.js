const ID_PREFIX = "virtual_id_";

export function convertLegacyPeople(legacyPeople, people, programs) {
  const convertedLegacyPeople = legacyPeople.map((name) => ({
    _id: ID_PREFIX + name,
    name,
  }));
  const allPeople = uniquePeople(people, convertedLegacyPeople);
  const convertedPrograms = replaceLegacyPeopleInPrograms(programs, allPeople);

  return { allPeople, convertedPrograms };
}

function uniquePeople(existing, fromLegacy) {
  return existing.concat(
    fromLegacy.filter(
      (person) =>
        existing.find(
          (existingPerson) => existingPerson.name === person.name
        ) === undefined
    )
  );
}

function replaceLegacyPeopleInPrograms(programs, people) {
  return programs.map((program) => ({
    ...program,
    people: program.people.map((person) => {
      if (typeof person === "string")
        return { person: people.find((p) => p.name === person)._id };
      else return person;
    }),
  }));
}
