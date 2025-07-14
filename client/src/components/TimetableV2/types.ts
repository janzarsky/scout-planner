import { Temporal } from "@js-temporal/polyfill";

export interface Program {
  pkg: string | null;
  notes: string;
  begin: number | null; // Null signifies that the program is in tray
  _id: string;
  duration: number;
  locked: boolean;
  ranges: { [key: string]: "0" | "1" | "2" | "3" };
  blockOrder: number;
  people: { person: string; optional?: boolean }[];
  title: string;
  place: string;
  url: string;
  groups: string[];
}

export type ScheduledProgram = Program & { begin: number };
export type UnscheduledProgram = Program & { begin: null };

export interface Pkg {
  _id: string;
  name: string;
  color: string;
}

export interface Group {
  _id: string;
  order: number;
  name: string;
}

export interface Person {
  _id: string;
  name: string;
}

export type Violation = { msg: string; program: string; satisied?: boolean };
export type Violations = Map<string, Violation[]>;

export type Lines = {
  date: Temporal.PlainDate;
  offset: number;
  concurrentLines: number;
  groups: { group: string | null; concurrentLines: number }[];
}[];

export type HoverStatus = null | {
  clientX: number;
  clientY: number;
};

export type HoverStatusExtended = null | {
  clientX: number;
  clientY: number;
  id: string;
};

export type Segment = {
  date: Temporal.PlainDate;
  plannable: Program;
  start: Temporal.PlainTime | null;
  end: Temporal.PlainTime | null;
  atendeeGroups: number[];
  blockOrders: number[][];
};

export type NewProgram = Omit<Program, "_id"> & { _id: any };

export const LOCAL_TIMEZONE = "UTC";
export const MIME_TYPE = "application/prs.plannable";
export const DEFAULT_PROGRAM_COLOR = "#81d4fa";
