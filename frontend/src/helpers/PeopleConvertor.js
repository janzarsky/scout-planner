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
        undefined
    )
  );
}

export function replaceLegacyPeopleInPrograms(programs, people) {
  return programs.map((program) => ({
    ...program,
    people: program.people.map((person) => {
      if (typeof person === "string")
        return { person: people.find((p) => p.name === person)._id };
      else return person;
    }),
  }));
}
