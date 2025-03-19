import { useSelector } from "react-redux";
import { ComposeSchedule } from "./ComposeSchedule";
import { Violations } from "./types";
import React from "react";
import { level } from "../../helpers/Level";

export default function Timetable({
  violations,
  printView = false,
}: {
  violations: Violations;
  timeProvider: null | (() => number);
  printView: boolean;
}) {
  const { userLevel } = useSelector<any, any>((state) => state.auth);
  return (
    <ComposeSchedule
      editable={userLevel >= level.EDIT && !printView}
      violations={violations}
      printView={printView}
    />
  );
}
