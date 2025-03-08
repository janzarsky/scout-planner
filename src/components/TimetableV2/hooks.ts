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
import { level } from "../../helpers/Level";

export function usePrograms(): Program[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: programs }: { data?: Program[] } = useGetProgramsQuery(table);
  return programs ?? [];
}

export function useGroups(): Group[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: groups }: { data?: Group[] } = useGetGroupsQuery(table);
  return [...(groups ?? [])].sort((a, b) => a.order - b.order);
}

export function usePkgs(): Pkg[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: pkgs }: { data?: Pkg[] } = useGetPackagesQuery(table);
  return pkgs ?? [];
}

export function usePeople(): Person[] {
  const { table } = useSelector<any, any>((state) => state.auth);
  const { data: people }: { data?: Person[] } = useGetPeopleQuery(table);
  return people ?? [];
}

export function useUpdateProgram(): (program: Program) => void {
  const { table } = useSelector<any, any>((state) => state.auth);
  const [updateProgramMutation] = useUpdateProgramMutation();
  return (program: Program) => {
    updateProgramMutation({ table, data: program });
  };
}

export function useAddProgram(): (program: NewProgram) => void {
  const { table } = useSelector<any, any>((state) => state.auth);
  const [addProgramMutation] = useAddProgramMutation();
  return (program: NewProgram) => {
    delete program._id;
    addProgramMutation({ table, data: program });
  };
}

export function useUserLevel(): number {
  const { userLevel } = useSelector<any, any>((state) => state.auth);
  return userLevel ?? level.VIEW;
}
