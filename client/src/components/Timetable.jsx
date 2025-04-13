import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useSelector } from "react-redux";
import { level } from "@scout-planner/common/level";
import { getTimeIndicatorRect, TimeIndicator } from "./TimeIndicator";
import { getTimetableSettings } from "../helpers/TimetableSettings";
import { useEffect, useMemo, useState } from "react";
import { Droppables } from "./Droppables";
import { DateHeaders, GroupHeaders, TimeHeaders } from "./Headers";
import { Blocks } from "./Blocks";
import { Tray } from "./Tray";
import { useGetGroupsQuery } from "../store/groupsApi";
import {
  DEFAULT_TIME_STEP,
  DEFAULT_WIDTH,
  useGetSettingsQuery,
} from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";

export default function Timetable({
  violations,
  timeProvider = null,
  printView = false,
}) {
  const { table, userLevel } = useSelector((state) => state.auth);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);

  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsQuery(table);
  const { data: timetableSettings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const timeStep = settingsLoaded
    ? timetableSettings.timeStep
    : DEFAULT_TIME_STEP;
  const settings = useMemo(
    () =>
      getTimetableSettings(
        programsLoaded ? programs : [],
        groupsLoaded ? groups : [],
        timeStep,
        timeProvider ? timeProvider() : Date.now(),
        !printView,
      ),
    [programs, groups, timetableSettings, timeProvider],
  );

  const [time, setTime] = useState(timeProvider ? timeProvider() : Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setTime(timeProvider ? timeProvider() : Date.now()),
      (1000 * timeStep) / 2,
    );

    return () => clearInterval(interval);
  }, []);

  const timeIndicatorRect = getTimeIndicatorRect(settings, time);
  const width = settingsLoaded ? timetableSettings.width : DEFAULT_WIDTH;

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="timetable"
        style={{
          gridTemplateRows:
            "repeat(" +
            (settings.days.length * settings.groupCnt + 1) +
            ", auto)",
          gridTemplateColumns:
            "auto auto repeat(" +
            settings.timeSpan * settings.timeHeaders.length +
            ", minmax(" +
            (width * 20) / 100 +
            "px, 1fr))",
        }}
      >
        {userLevel >= level.EDIT && <Droppables settings={settings} />}
        <TimeHeaders settings={settings} />
        <DateHeaders settings={settings} />
        <GroupHeaders settings={settings} />
        <Blocks settings={settings} violations={violations} />
        {timeIndicatorRect && (
          <TimeIndicator
            x={timeIndicatorRect.x}
            y={timeIndicatorRect.y}
            height={timeIndicatorRect.height}
          />
        )}
      </div>
      {!printView && <Tray settings={settings} />}
    </DndProvider>
  );
}
