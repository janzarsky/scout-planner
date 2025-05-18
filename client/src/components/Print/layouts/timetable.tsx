import React from "react";
import { level } from "@scout-planner/common/level";
import { TimetableWrapper } from "../../App";
import { PrintLayout } from "./types";

const timetable: PrintLayout<null> = {
  label: "Klasické",
  initialOptions: null,
  OptionsComponent: () => null,
  validateOptions: (opt): opt is null => true,
  PrintComponent: ({ violationsPerProgram }) => (
    <TimetableWrapper
      dataLoaded={true}
      permissionsLoaded={true}
      violationsPerProgram={violationsPerProgram}
      userLevel={level.VIEW}
      printView={true}
    />
  ),
};

export default timetable;
