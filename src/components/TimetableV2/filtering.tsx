import React, { useMemo } from "react";
import { useState } from "react";
import { usePeople, usePkgs, usePrograms } from "./hooks";

interface FiltersState {
  owner: string | null;
  package: string | null;
}

interface Filters {
  state: FiltersState;
  component: React.ReactNode;
}

export function useFilters(): Filters {
  const [state, setState] = useState<FiltersState>(() => ({
    owner: null,
    package: null,
  }));

  const programs = usePrograms();

  // People filter
  const people = usePeople();
  const availableOwners = useMemo(() => {
    const result: { id: string; name: string; count: number }[] = [];
    for (const program of programs) {
      for (const { person: ownerId } of program.people) {
        let ownerRecord = result.find((it) => it.id === ownerId);
        if (!ownerRecord) {
          const person = people.find((it) => it._id === ownerId);
          if (!person) {
            continue;
          }
          ownerRecord = { id: ownerId, name: person.name, count: 0 };
          result.push(ownerRecord);
        }
        ownerRecord!.count++;
      }
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [programs, people]);

  // Package filter
  const programmeGroups = usePkgs();
  const availablePackages = useMemo(() => {
    const result = programmeGroups.map((it) => ({
      id: it._id,
      name: it.name,
      color: it.color,
      count: 0,
    }));

    for (const program of programs) {
      if (!program.pkg) {
        continue;
      }
      const packageRecord = result.find((it) => it.id === program.pkg);
      if (packageRecord) {
        packageRecord.count++;
      }
    }

    return result;
  }, [programs, programmeGroups]);

  return {
    state,
    component: (
      <>
        <label>
          Majitel programu:{" "}
          <select
            value={state.owner ?? ""}
            onChange={(e) =>
              setState({ ...state, owner: e.target.value || null })
            }
          >
            <option value="">Všichni</option>
            {availableOwners.map((it) => (
              <option key={it.id} value={it.id}>
                {it.name} ({it.count})
              </option>
            ))}
          </select>
        </label>
        <label>
          Balíček:{" "}
          <select
            value={state.package ?? ""}
            onChange={(e) =>
              setState({ ...state, package: e.target.value || null })
            }
          >
            <option value="">Všechny</option>
            {availablePackages.map((it) => (
              <option
                key={it.id}
                value={it.id}
                style={{ backgroundColor: it.color }}
              >
                {it.name} ({it.count})
              </option>
            ))}
          </select>
        </label>
      </>
    ),
  };
}

/**
 * Determines if a program should be highlighted based on filters
 */
export function isProgramHighlighted(
  program: { people: { person: string }[]; pkg: string | null },
  { owner: ownerFilter, package: packageFilter }: FiltersState,
): boolean {
  if (ownerFilter === null && packageFilter === null) {
    return true;
  }
  const ownerSatisfied =
    ownerFilter === null ||
    program.people.some((it) => it.person === ownerFilter);
  const packageSatified =
    packageFilter === null || program.pkg === packageFilter;
  return ownerSatisfied && packageSatified;
}
