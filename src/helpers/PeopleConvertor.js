const ID_PREFIX = "virtual_id_";

export function convertLegacyPeople(legacyPeople, people) {
  const convertedLegacyPeople = legacyPeople.map((name) => ({
    _id: ID_PREFIX + name,
    name,
  }));

  return people.concat(
    convertedLegacyPeople.filter(
      (person) =>
        people.find((existingPerson) => existingPerson.name === person.name) ===
        undefined,
    ),
  );
}

export function replaceLegacyPeopleInPrograms(programs, people) {
  return programs.map((program) => ({
    ...program,
    people: convertProgramPeople(program.people, people),
  }));
}

export function convertProgramPeople(programPeople, allPeople) {
  return programPeople.flatMap((person) => {
    if (typeof person === "string") {
      const found = allPeople.find((p) => p.name === person);
      return found ? [{ person: found._id }] : [];
    } else return [person];
  });
}
