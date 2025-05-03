import timetable from "./timetable";
import singleDay from "./singleDay";
import { PrintLayout } from "./types";

export * from "./types";

export const layouts = {
  timetable,
  singleDay,
} as const;
