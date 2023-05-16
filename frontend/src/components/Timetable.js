import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { formatDay } from "../helpers/DateUtils";
import { getRect, groupProgramsToBlocks } from "../helpers/TimetableUtils";
import { level } from "../helpers/Level";
import { addError } from "../store/errorsSlice";
import { updateProgram } from "../store/programsSlice";
import Program from "./Program";
import { getTimeIndicatorRect, TimeIndicator } from "./TimeIndicator";
import { getTimetableSettings } from "../helpers/TimetableSettings";
import { getProgramRects, sortTrayPrograms } from "./Tray";

export default function Timetable({
  violations,
  addProgramModal,
  onEdit,
  timeProvider = () => Date.now(),
}) {
  const dispatch = useDispatch();
  const { programs } = useSelector((state) => state.programs);
  const { trayFeature } = useSelector((state) => state.config);

  const { table, userLevel } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  function onDroppableDrop(item, begin, groupId, currentPrograms) {
    var prog = currentPrograms.find((program) => program._id === item.id);
    if (prog) {
      // single-group programs should be always updated according to the target group,
      // multi-group programs should be only updated in case they are dragged to a new group
      const groups =
        !groupId || prog.groups.indexOf(groupId) !== -1
          ? prog.groups
          : [groupId];

      client.updateProgram({ ...prog, begin, groups }).then(
        (resp) => dispatch(updateProgram(resp)),
        (e) => dispatch(addError(e.message))
      );
    }
  }

  const { groups } = useSelector((state) => state.groups);
  const { settings: timetableSettings } = useSelector(
    (state) => state.settings
  );
  const settings = getTimetableSettings(
    programs,
    groups,
    timetableSettings.timeStep,
    timeProvider()
  );
  const timeIndicatorRect = getTimeIndicatorRect(settings, timeProvider());

  return (
    <TimetableDndWrapper settings={settings}>
      {userLevel >= level.EDIT &&
        getDroppables(settings, onDroppableDrop, addProgramModal)}
      {getTimeHeaders(settings)}
      {getDateHeaders(settings)}
      {getGroupHeaders(settings)}
      {getBlocks(
        programs,
        settings,
        violations,
        onEdit,
        onDroppableDrop,
        addProgramModal
      )}
      {trayFeature && (
        <Tray
          settings={settings}
          programs={programs}
          onEdit={onEdit}
          addProgramModal={addProgramModal}
          onDroppableDrop={onDroppableDrop}
        />
      )}
      {timeIndicatorRect && (
        <TimeIndicator
          x={timeIndicatorRect.x}
          y={timeIndicatorRect.y}
          height={timeIndicatorRect.height}
        />
      )}
    </TimetableDndWrapper>
  );
}

function TimetableDndWrapper({ settings, children }) {
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
        {children}
      </div>
    </DndProvider>
  );
}

function getBlocks(
  programs,
  settings,
  violations,
  onEdit,
  onDrop,
  addProgramModal
) {
  const allGroups = settings.groups.map((g) => g._id);
  const programsGroupFix = programs.map((p) => ({
    ...p,
    groups: p.groups.length > 0 ? p.groups : allGroups,
  }));
  const programsNotInTray = programsGroupFix.filter(
    (p) => typeof p.begin === "number"
  );
  const blocks = groupProgramsToBlocks(programsNotInTray);

  return blocks.map((block) => {
    const blockRect = getRect(
      block.begin,
      block.duration,
      block.groups,
      settings
    );

    return (
      <Block
        key={`${block.programs[0].begin}-${
          block.programs[0].duration
        }-${block.programs[0].groups.join("-")}`}
        rect={blockRect}
      >
        {block.programs.map((program) =>
          getProgram(program, blockRect, settings, violations, onEdit)
        )}
        {getBlockDroppables(
          blockRect.width,
          block.programs.length,
          block.programs[0].begin,
          settings.timeStep,
          block.programs[0].groups.length > 0
            ? block.programs[0].groups[0]
            : null,
          onDrop,
          addProgramModal
        )}
      </Block>
    );
  });
}

function getProgram(prog, blockRect, settings, violations, onEdit) {
  const programRect = getRect(prog.begin, prog.duration, prog.groups, settings);

  const blockOrder = prog.blockOrder ? prog.blockOrder : 0;
  const relativeRect = {
    x: programRect.x - blockRect.x,
    y: programRect.y - blockRect.y + blockOrder,
    width: programRect.width,
    height: 1,
  };

  return (
    <Program
      key={prog._id}
      rect={relativeRect}
      program={prog}
      violations={violations.get(prog._id)}
      onEdit={onEdit}
    />
  );
}

function getBlockDroppables(
  width,
  height,
  blockBegin,
  timeStep,
  groupId,
  onDrop,
  addProgramModal
) {
  return [...Array(width).keys()].flatMap((x) =>
    [...Array(height).keys()].map((y) => {
      const begin = blockBegin + x * timeStep;
      return (
        <Droppable
          key={`${x}-${y}`}
          x={x + 1}
          y={y + 1}
          onDrop={(item, programs) => onDrop(item, begin, groupId, programs)}
          addProgramModal={() => addProgramModal({ begin, groupId })}
        />
      );
    })
  );
}

function getDroppables(settings, onDrop, addProgramModal) {
  // ensure there is always at least one group
  const groups = settings.groups.length > 0 ? settings.groups : [{ _id: null }];

  return settings.days.flatMap((date, idxDate) =>
    settings.timeHeaders.flatMap((time, idxTime) =>
      [...Array(settings.timeSpan).keys()].flatMap((idxSpan) => {
        const begin = date + time + idxSpan * settings.timeStep;

        return groups.map((group, idxGroup) => (
          <Droppable
            key={`${begin}-${group._id}`}
            x={3 + idxTime * settings.timeSpan + idxSpan}
            y={2 + idxDate * settings.groupCnt + idxGroup}
            onDrop={(item, programs) =>
              onDrop(item, begin, group._id, programs)
            }
            addProgramModal={() =>
              addProgramModal({ begin, groupId: group._id })
            }
          />
        ));
      })
    )
  );
}

function getTimeHeaders(settings) {
  return settings.timeHeaders.map((time, idx) => (
    <TimeHeader
      key={time}
      time={new Date(time)}
      pos={idx * settings.timeSpan + 3}
      span={settings.timeSpan}
    />
  ));
}

function getDateHeaders(settings) {
  return settings.days.map((date, idx) => (
    <DateHeader
      key={date}
      date={new Date(date)}
      pos={idx * settings.groupCnt + 2}
      span={settings.groupCnt}
    />
  ));
}

function getGroupHeaders(settings) {
  return settings.days.flatMap((date, idx) =>
    settings.groups.map((group, groupIdx) => (
      <GroupHeader
        key={`group,${date},${group._id}`}
        pos={idx * settings.groupCnt + groupIdx + 2}
        name={group.name}
      />
    ))
  );
}

function Droppable({ onDrop, x, y, addProgramModal }) {
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
      style={{ gridColumnStart: x, gridRowStart: y }}
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

function Block({ rect, children }) {
  return (
    <div
      className="block"
      style={{
        gridColumnStart: rect.x + 3,
        gridRowStart: rect.y + 2,
        gridColumnEnd: "span " + rect.width,
        gridRowEnd: "span " + rect.height,
        gridTemplateColumns: "repeat(" + rect.width + ", minmax(20px, 1fr))",
      }}
    >
      {children}
    </div>
  );
}

function Tray({ settings, onEdit, addProgramModal, onDroppableDrop }) {
  const { programs } = useSelector((state) => state.programs);
  const { packages } = useSelector((state) => state.packages);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => onDroppableDrop(item, null, null, programs),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [programs]
  );

  const trayPrograms = programs.filter((p) => typeof p.begin !== "number");
  const sortedPrograms = sortTrayPrograms(trayPrograms, packages);

  const programRects = getProgramRects(sortedPrograms, settings);

  return (
    <>
      <div
        className="tray-header"
        style={{
          gridRowStart: settings.days.length * settings.groupCnt + 2,
        }}
        title="Odkladiště"
      >
        <i className="fa fa-archive" aria-hidden="true"></i>
      </div>
      <div
        className={"tray" + (isOver ? " drag-over" : "")}
        style={{
          gridRowStart: settings.days.length * settings.groupCnt + 2,
          gridColumnEnd:
            "span " + settings.timeHeaders.length * settings.timeSpan,
        }}
      >
        <Block
          rect={getRect(
            settings.dayStart,
            settings.dayEnd - settings.dayStart,
            [],
            settings
          )}
        >
          <button
            ref={drop}
            className="tray-add-program"
            onClick={() => addProgramModal({ begin: null, groupId: null })}
          >
            <i className="fa fa-plus" aria-hidden="true" title="Nový program" />
          </button>
          {programRects.map(([program, rect]) => {
            return (
              <Program
                key={program._id}
                rect={rect}
                program={program}
                onEdit={onEdit}
              />
            );
          })}
        </Block>
      </div>
    </>
  );
}
