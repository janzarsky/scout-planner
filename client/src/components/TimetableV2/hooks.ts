import { useSelector } from "react-redux";
import { useGetGroupsQuery } from "../../store/groupsApi";
import { useGetPackagesQuery } from "../../store/packagesApi";
import {
  useGetProgramsQuery,
  useUpdateProgramMutation,
  useAddProgramMutation,
} from "../../store/programsApi";
import { useGetPeopleQuery } from "../../store/peopleApi";
import { Group, NewProgram, Person, Pkg, Program } from "./types";
import { level } from "@scout-planner/common/level";
import { useCallback, useMemo } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { epochMillisecondsToPlainDateTime } from "./utils";

export function usePrograms(): Program[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: programs }: { data?: Program[] } = useGetProgramsQuery(table);
  return programs ?? [];
}

export function useGroups(): Group[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: groups }: { data?: Group[] } = useGetGroupsQuery(table);
  return useMemo(
    () => [...(groups ?? [])].sort((a, b) => a.order - b.order),
    [groups],
  );
}

export function usePkgs(): Pkg[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: pkgs }: { data?: Pkg[] } = useGetPackagesQuery(table);
  return pkgs ?? [];
}

export function usePkg(pkgId: string | null): Pkg | undefined {
  const pkgs = usePkgs();
  return useMemo(() => {
    if (!pkgId) {
      return undefined;
    }
    return pkgs.find((pkg) => pkg._id === pkgId);
  }, [pkgs, pkgId]);
}

export function usePeople(): Person[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: people }: { data?: Person[] } = useGetPeopleQuery(table);
  return people ?? [];
}

export function useUpdateProgram(): (program: Program) => void {
  const { table } = useSelector<any, any>((state) => state.auth);
  const [updateProgramMutation] = useUpdateProgramMutation();
  return useCallback(
    (program: Program) => {
      updateProgramMutation({ table, data: program });
    },
    [table, updateProgramMutation],
  );
}

export function useAddProgram(): (program: NewProgram) => void {
  const { table } = useSelector<any, any>((state) => state.auth);
  const [addProgramMutation] = useAddProgramMutation();
  return useCallback(
    (program: NewProgram) => {
      delete program._id;
      addProgramMutation({ table, data: program });
    },
    [table, addProgramMutation],
  );
}

export function useUserLevel(): number {
  const { userLevel } = useSelector<any, any>((state) => state.auth);
  return userLevel ?? level.VIEW;
}

/**
 * Returns a list of unique program dates sorted in ascending order.
 *
 * @returns {Temporal.PlainDate[]} An array of unique program dates.
 */
export function getProgramDates() {
  const programs = usePrograms();
  const dates = useMemo(() => {
    const dates: Temporal.PlainDate[] = [];
    for (const program of programs) {
      if (program.begin) {
        const d = epochMillisecondsToPlainDateTime(program.begin).toPlainDate();
        if (!dates.some((it) => it.equals(d))) {
          dates.push(d);
        }
      }
    }
    return [...dates].sort((a, b) => Temporal.PlainDate.compare(a, b));
  }, [programs]);
  return dates;
}
