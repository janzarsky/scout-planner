import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import Client from "../Client";
import {
  formatDay,
  getOnlyDate,
  getOnlyTime,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import { byOrder } from "../helpers/Sorting";
import { addError } from "../store/errorsSlice";
import { updateProgram } from "../store/programsSlice";
import Program from "./Program";
import TimeIndicator from "./TimeIndicator";

export default function Timetable({ violations, addProgramModal, onEdit }) {
  const dispatch = useDispatch();
  const { programs } = useSelector((state) => state.programs);

  const { token, table, userLevel } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  function onDroppableDrop(item, begin, currentPrograms) {
    var prog = currentPrograms.find((program) => program._id === item.id);
    if (prog) {
      client.updateProgram({ ...prog, begin }).then(
        (resp) => dispatch(updateProgram(resp)),
        (e) => dispatch(addError(e.message))
      );
    }
  }

  function* getPrograms(programs, settings) {
    for (const prog of programs) {
      const rect = getProgramRect(prog, settings);

      if (prog.shared) continue;

      if (rect.x >= 0 && rect.y >= 0)
        yield (
          <Program
            key={prog._id}
            program={prog}
            violations={violations.get(prog._id)}
            rect={rect}
            onEdit={onEdit}
          />
        );
      else
        console.warn(
          `The computed rectangle ${rect} for program ${prog._id} is invalid`
        );
    }
  }

  function* getSharedPrograms(programs, settings) {
    const hasGroupOverlap = (prog1, prog2) =>
      prog1.groups.length === 0 ||
      prog2.groups.length === 0 ||
      prog1.groups.filter((group) => prog2.groups.indexOf(group) !== -1)
        .length > 0;

    function getBlocks(programs) {
      const blocks = [];
      const sorted = [...programs].sort((a, b) => (a.begin < b.begin ? -1 : 1));

      sorted.forEach((prog1, idx1) => {
        for (let idx2 = idx1 + 1; idx2 < sorted.length; idx2++) {
          const prog2 = sorted[idx2];

          if (prog2.begin >= prog1.begin + prog1.duration) break;

          if (hasGroupOverlap(prog1, prog2)) {
            overlaps.push({
              program: prog1._id,
            });
            overlaps.push({
              program: prog2._id,
            });
          }
        }
      });

      return overlaps;
    }

    const sharedPrograms = programs.filter((p) => p.shared);
    const blocks = getBlocks(sharedPrograms);

    for (const prog of programs) {
      const rect = getProgramRect(prog, settings);

      if (rect.x >= 0 && rect.y >= 0)
        yield (
          <Program
            key={prog._id}
            program={prog}
            violations={violations.get(prog._id)}
            rect={rect}
            onEdit={onEdit}
          />
        );
      else
        console.warn(
          `The computed rectangle ${rect} for program ${prog._id} is invalid`
        );
    }
  }

  const { groups } = useSelector((state) => state.groups);
  const { settings: timetableSettings } = useSelector(
    (state) => state.settings
  );
  const settings = getSettings(programs, groups, timetableSettings.timeStep);
  const timeIndicatorRect = getTimeIndicatorRect(settings);

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
            ", minmax(20px, 1fr))",
        }}
      >
        {userLevel >= level.EDIT && [
          ...getDroppables(settings, onDroppableDrop, addProgramModal),
        ]}
        {[...getTimeHeaders(settings)]}
        {[...getDateHeaders(settings)]}
        {[...getGroupHeaders(settings)]}
        {[...getPrograms(programs, settings)]}
        {[...getSharedPrograms(programs, settings)]}
        {timeIndicatorRect && (
          <TimeIndicator
            x={timeIndicatorRect.x}
            y={timeIndicatorRect.y}
            height={timeIndicatorRect.height}
          />
        )}
      </div>
    </DndProvider>
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
            key={begin}
            x={3 + idxTime * settings.timeSpan + idxSpan}
            y={2 + idxDate * settings.groupCnt}
            height={settings.groupCnt}
            onDrop={(item, programs) => onDrop(item, begin, programs)}
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
  if (currTime < settings.dayStart || currTime > settings.dayEnd) return null;

  const currDate = getOnlyDate(zoneAdjust);
  if (settings.days.indexOf(currDate) === -1) return null;

  return {
    x: Math.ceil((currTime - settings.dayStart) / settings.timeStep),
    y: settings.days.indexOf(currDate) * settings.groupCnt,
    height: settings.groupCnt,
  };
}

function Droppable({ onDrop, x, y, height, addProgramModal }) {
  const { programs } = useSelector((state) => state.programs);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => onDrop(item, programs),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [programs]
  );

  return (
    <div
      ref={drop}
      className={"droppable " + (isOver ? "drag-over" : "")}
      style={{
        gridColumnStart: x,
        gridRowStart: y,
        gridRowEnd: "span " + height,
      }}
      onClick={(_) => addProgramModal()}
    />
  );
}

function TimeHeader({ time, pos, span }) {
  return (
    <div
      className="timeheader"
      style={{
        gridColumnStart: pos,
        gridColumnEnd: "span " + span,
      }}
    >
      {time.getUTCHours()}
    </div>
  );
}

function DateHeader({ date, pos, span }) {
  return (
    <div
      className="dateheader"
      style={{
        gridRowStart: pos,
        gridRowEnd: "span " + span,
      }}
    >
      {formatDay(date.getTime())}
      <br />
      {date.getUTCDate()}.<br />
      {date.getUTCMonth() + 1}.
    </div>
  );
}

function GroupHeader({ pos, name }) {
  return (
    <div className="groupheader" style={{ gridRowStart: pos }}>
      {name}
    </div>
  );
}
