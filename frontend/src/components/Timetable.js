import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { getRect } from "../helpers/TimetableUtils";
import { level } from "../helpers/Level";
import { addError } from "../store/errorsSlice";
import { updateProgram } from "../store/programsSlice";
import Program from "./Program";
import { getTimeIndicatorRect, TimeIndicator } from "./TimeIndicator";
import { getTimetableSettings } from "../helpers/TimetableSettings";
import { getProgramRects, sortTrayPrograms } from "./Tray";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droppables } from "./Droppables";
import { DateHeaders, GroupHeaders, TimeHeaders } from "./Headers";
import { Block, Blocks } from "./Blocks";

export default function Timetable({ violations, timeProvider = null }) {
  const dispatch = useDispatch();
  const { programs } = useSelector((state) => state.programs);

  const { table, userLevel } = useSelector((state) => state.auth);
  const client = useMemo(() => clientFactory.getClient(table), [table]);

  const onDroppableDrop = useCallback(
    (item, begin, groupId, currentPrograms) => {
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
    },
    [client, dispatch]
  );

  const { groups } = useSelector((state) => state.groups);
  const { settings: timetableSettings } = useSelector(
    (state) => state.settings
  );
  const settings = useMemo(
    () =>
      getTimetableSettings(
        programs,
        groups,
        timetableSettings.timeStep,
        timeProvider ? timeProvider() : Date.now()
      ),
    [programs, groups, timetableSettings, timeProvider]
  );
  const timeIndicatorRect = getTimeIndicatorRect(
    settings,
    timeProvider ? timeProvider() : Date.now()
  );

  const width = useSelector((state) => state.settings.settings.width);

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
        {userLevel >= level.EDIT && (
          <Droppables settings={settings} onDrop={onDroppableDrop} />
        )}
        <TimeHeaders settings={settings} />
        <DateHeaders settings={settings} />
        <GroupHeaders settings={settings} />
        <Blocks
          settings={settings}
          violations={violations}
          onDrop={onDroppableDrop}
        />
        {timeIndicatorRect && (
          <TimeIndicator
            x={timeIndicatorRect.x}
            y={timeIndicatorRect.y}
            height={timeIndicatorRect.height}
          />
        )}
      </div>
      <Tray
        settings={settings}
        programs={programs}
        onDroppableDrop={onDroppableDrop}
      />
    </DndProvider>
  );
}

function Tray({ settings, onDroppableDrop }) {
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

  const width = useSelector((state) => state.settings.settings.width);
  const userLevel = useSelector((state) => state.auth.userLevel);

  const trayPrograms = programs.filter((p) => typeof p.begin !== "number");
  const sortedPrograms = sortTrayPrograms(trayPrograms, packages);

  const programRects = getProgramRects(
    sortedPrograms,
    settings,
    userLevel >= level.EDIT
  );

  const [pinned, setPinned] = useState(false);

  const navigate = useNavigate();

  return (
    <div
      className={"tray-wrapper" + (pinned ? " pinned" : "")}
      style={{
        gridTemplateColumns:
          "auto auto repeat(" +
          settings.timeSpan * settings.timeHeaders.length +
          ", minmax(" +
          (width * 20) / 100 +
          "px, 1fr))",
      }}
    >
      <div
        className="tray-header"
        style={{
          gridRowStart: settings.days.length * settings.groupCnt + 2,
        }}
        title="Odkladiště"
      >
        <div className="tray-header-icon">
          <i className="fa fa-archive" aria-hidden="true"></i>
        </div>
        <button
          className={"btn" + (pinned ? " btn-dark" : "")}
          onClick={() => setPinned(!pinned)}
          title="Připnout"
        >
          <i className="fa fa-thumb-tack" aria-hidden="true"></i>
        </button>
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
          {userLevel >= level.EDIT && (
            <button
              ref={drop}
              className="tray-add-program"
              onClick={() =>
                navigate("add", { state: { begin: null, groupId: null } })
              }
            >
              {!isOver && (
                <i
                  className="fa fa-plus"
                  aria-hidden="true"
                  title="Nový program"
                />
              )}
            </button>
          )}
          {programRects.map(([program, rect]) => {
            return <Program key={program._id} rect={rect} program={program} />;
          })}
        </Block>
      </div>
    </div>
  );
}
