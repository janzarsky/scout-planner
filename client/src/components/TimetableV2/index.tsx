import { useSelector } from "react-redux";
import { ComposeSchedule } from "./ComposeSchedule";
import { Violations } from "./types";
import React from "react";
import { level } from "@scout-planner/common/level";

export default function Timetable({
  violations,
  printView = false,
  showOnlyGroups,
}: {
  violations: Violations;
  timeProvider: null | (() => number);
  printView: boolean;
  showOnlyGroups?: string[];
}) {
  const { userLevel } = useSelector<any, any>((state) => state.auth);
  return (
    <ComposeSchedule
      editable={userLevel >= level.EDIT && !printView}
      violations={violations}
      printView={printView}
      showOnlyGroups={showOnlyGroups}
    />
  );
}
