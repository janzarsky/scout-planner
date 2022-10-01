import React, { useRef, useState } from "react";
import {
  formatDay,
  getOnlyDate,
  getOnlyTime,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import { byOrder } from "../helpers/Sorting";
import Program from "./Program";
import TimeIndicator from "./TimeIndicator";

export default function Timetable(props) {
  const draggedProgram = useRef();

  function onDroppableDrop(begin) {
    var prog = props.programs.find(
      (program) => program._id === draggedProgram.current
    );
    if (prog) {
      prog.begin = begin;
      props.updateProgram(prog);
    }
  }

  function onProgramDragStart(id) {
    draggedProgram.current = id;
  }

  function* getPrograms(programs, settings, viewSettings, userLevel) {
    for (const prog of programs) {
      const rect = getProgramRect(prog, settings);

      if (rect.x >= 0 && rect.y >= 0)
        yield (
          <Program
            key={prog._id}
            program={prog}
            highlighted={props.highlightedPackages.indexOf(prog.pkg) !== -1}
            violations={props.violations.get(prog._id)}
            rect={rect}
            onDragStart={onProgramDragStart}
            pkgs={props.pkgs}
            onEdit={props.onEdit}
            viewSettings={viewSettings}
            clone={props.clone}
            activeRange={props.activeRange}
            userLevel={props.userLevel}
          />
        );
      else
        console.warn(
          `The computed rectangle ${rect} for program ${prog._id} is invalid`
        );
    }
  }

  const settings = getSettings(props.programs, props.groups, props.timeStep);

  return (
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
          ", minmax(20px, 1fr))",
      }}
    >
      {props.userLevel >= level.EDIT && [
        ...getDroppables(settings, onDroppableDrop, props.addProgramModal),
      ]}
      {[...getTimeHeaders(settings)]}
      {[...getDateHeaders(settings)]}
      {[...getGroupHeaders(settings)]}
      {[
        ...getPrograms(
          props.programs,
          settings,
          props.viewSettings,
          props.userLevel
        ),
      ]}
      <TimeIndicator rect={getTimeIndicatorRect(settings)} />
    </div>
  );
}

function getSettings(programs, groups, timeStep) {
  const hour = parseDuration("1:00");

  if (programs.length === 0) programs = [{ begin: Date.now(), duration: hour }];

  var settings = {};

  settings.days = [];
  for (const prog of programs) {
    settings.days.push(getOnlyDate(prog.begin));
  }
  settings.days = [...new Set(settings.days)].sort();
  settings.days = addEmptyDays(settings.days);

  settings.dayStart = parseTime("10:00");
  for (const prog of programs) {
    const time = getOnlyTime(prog.begin);
    if (time < settings.dayStart) settings.dayStart = time;
  }

  settings.dayEnd = parseTime("16:00");
  for (const prog of programs) {
    let time = getOnlyTime(prog.begin + prog.duration);
    if (time === 0) time = parseTime("23:59");
    if (time > settings.dayEnd) settings.dayEnd = time;
  }

  settings.timeHeaders = Array.from(
    { length: Math.ceil((settings.dayEnd - settings.dayStart) / hour) },
    (_, idx) => settings.dayStart + idx * hour
  );
  settings.timeStep = timeStep;
  settings.timeSpan = Math.ceil(hour / timeStep);
  settings.groups = [...groups].sort(byOrder);
  settings.groupCnt = groups.length > 0 ? groups.length : 1;

  return settings;
}

/**
 * Add empty days so that the timetable is not "confusing"
 *
 * The timetable shows only days that contain at least one program. This may be confusing in
 * certain situations:
 *  - consider a Fri-Sun event, when you delete everything on Saturday, it will disappear.
 *    Ideally, the day should remain there.
 *  - when creating a new event, there should be some free days so that drag and drop is easier,
 *    so if you start with event on Friday, there should be also Saturday and Sunday
 *
 * @param days at least one day must be supplied
 */
function addEmptyDays(days) {
  const dayLength = parseDuration("24:00");

  // if there are at most 3 missing days, add them
  const missingDaysLimit = 3;
  const missingDays = (last, curr) =>
    curr - last < (missingDaysLimit + 2) * dayLength
      ? Array.from(
          { length: (curr - last) / dayLength - 1 },
          (_, i) => last + (i + 1) * dayLength
        )
      : [];

  const extendedDays = days.reduce((prev, curr) => {
    return [
      ...prev,
      ...(prev.length > 0 ? missingDays(prev[prev.length - 1], curr) : []),
      curr,
    ];
  }, []);

  // make sure there are always at least 3 days shown
  const minDaysLimit = 3;
  if (extendedDays.length < minDaysLimit)
    return extendedDays.concat(
      Array.from(
        { length: minDaysLimit - extendedDays.length },
        (_, i) => extendedDays[extendedDays.length - 1] + (i + 1) * dayLength
      )
    );

  return extendedDays;
}

function* getDroppables(settings, onDrop, addProgramModal) {
  for (const [idxDate, date] of settings.days.entries()) {
    for (const [idxTime, time] of settings.timeHeaders.entries()) {
      for (let idxSpan = 0; idxSpan < settings.timeSpan; idxSpan++) {
        const begin = date + time + idxSpan * settings.timeStep;
        yield (
          <Droppable
            key={[idxTime, idxDate, idxSpan]}
            x={3 + idxTime * settings.timeSpan + idxSpan}
            y={2 + idxDate * settings.groupCnt}
            height={settings.groupCnt}
            onDrop={() => onDrop(begin)}
            addProgramModal={() => addProgramModal({ begin })}
          />
        );
      }
    }
  }
}

function* getTimeHeaders(settings) {
  for (const [idx, time] of settings.timeHeaders.entries()) {
    yield (
      <TimeHeader
        key={time}
        time={new Date(time)}
        pos={idx * settings.timeSpan + 3}
        span={settings.timeSpan}
      />
    );
  }
}

function* getDateHeaders(settings) {
  for (const [idx, date] of settings.days.entries()) {
    yield (
      <DateHeader
        key={date}
        date={new Date(date)}
        pos={idx * settings.groupCnt + 2}
        span={settings.groupCnt}
      />
    );
  }
}

function* getGroupHeaders(settings) {
  for (const [idx, date] of settings.days.entries()) {
    for (const [groupIdx, group] of settings.groups.entries()) {
      yield (
        <GroupHeader
          key={`group,${date},${group._id}`}
          pos={idx * settings.groupCnt + groupIdx + 2}
          name={group.name}
        />
      );
    }
  }
}

function getProgramRect(program, settings) {
  const date = getOnlyDate(program.begin);
  const time = getOnlyTime(program.begin);

  var [first, last] = [0, settings.groupCnt - 1];

  if (program.groups && program.groups.length > 0) {
    const groupMap = settings.groups.map(
      (group) => program.groups.findIndex((idx) => idx === group._id) !== -1
    );
    first = groupMap.reduce(
      (acc, cur, idx) => (cur && idx < acc ? idx : acc),
      settings.groupCnt - 1
    );
    last = groupMap.reduce(
      (acc, cur, idx) => (cur && idx > acc ? idx : acc),
      0
    );
  }

  return {
    x: Math.ceil((time - settings.dayStart) / settings.timeStep),
    y: settings.days.indexOf(date) * settings.groupCnt + first,
    width: Math.ceil(program.duration / settings.timeStep),
    height: last - first + 1,
  };
}

function getTimeIndicatorRect(settings) {
  const now = Date.now();
  // the times in timetable are in UTC (we don't know the timezone of the actual event)
  // the indicator assumes that you are in the correct timezone
  const zoneAdjust = now - new Date(now).getTimezoneOffset() * 60 * 1000;

  const currTime = getOnlyTime(zoneAdjust);
  if (currTime < settings.dayStart || currTime > settings.dayEnd)
    return <div />;

  const currDate = getOnlyDate(zoneAdjust);
  if (settings.days.indexOf(currDate) === -1) return <div />;

  return {
    x: Math.ceil((currTime - settings.dayStart) / settings.timeStep),
    y: settings.days.indexOf(currDate) * settings.groupCnt,
    width: 1,
    height: settings.groupCnt,
  };
}

function Droppable(props) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      className={"droppable " + (dragOver ? "drag-over" : "")}
      style={{
        gridColumnStart: props.x,
        gridRowStart: props.y,
        gridRowEnd: "span " + props.height,
      }}
      onClick={(_) => props.addProgramModal()}
      onDrop={(e) => {
        e.preventDefault();
        props.onDrop();
        setDragOver(false);
      }}
      onDragEnter={() => setDragOver(true)}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => setDragOver(false)}
    />
  );
}

function TimeHeader(props) {
  return (
    <div
      className="timeheader"
      style={{
        gridColumnStart: props.pos,
        gridColumnEnd: "span " + props.span,
      }}
    >
      {props.time.getUTCHours()}
    </div>
  );
}

function DateHeader(props) {
  return (
    <div
      className="dateheader"
      style={{
        gridRowStart: props.pos,
        gridRowEnd: "span " + props.span,
      }}
    >
      {formatDay(props.date.getTime())}
      <br />
      {props.date.getUTCDate()}.<br />
      {props.date.getUTCMonth() + 1}.
    </div>
  );
}

function GroupHeader(props) {
  return (
    <div
      className="groupheader"
      style={{
        gridRowStart: props.pos,
      }}
    >
      {props.name}
    </div>
  );
}
