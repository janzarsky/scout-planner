import { useMemo } from "react";
import { usePeople } from "./hooks";
import { Program } from "./types";

export function useProgramPeopleString(program: Program) {
  const people = usePeople();

  return useMemo(() => {
    const owners = program.people.map((person) => ({
      name: people.find((p) => p._id === person.person)?.name ?? person.person,
      optional: person.optional,
    }));
    const nonOptionalOwners = owners.filter((owner) => !owner.optional);
    const optionalOwners = owners.filter((owner) => owner.optional);
    const ownersString = nonOptionalOwners
      .map((owner) => owner.name)
      .join(", ");
    const optionalOwnersString = optionalOwners
      .map((owner) => owner.name)
      .join(", ");
    return (
      ownersString + (optionalOwnersString ? ` (${optionalOwnersString})` : "")
    );
  }, [people, program.people]);
}
