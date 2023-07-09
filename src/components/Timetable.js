import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDispatch, useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";
import { level } from "../helpers/Level";
import { addError } from "../store/errorsSlice";
import { updateProgram } from "../store/programsSlice";
import { getTimeIndicatorRect, TimeIndicator } from "./TimeIndicator";
import { getTimetableSettings } from "../helpers/TimetableSettings";
import { useCallback, useMemo } from "react";
import { Droppables } from "./Droppables";
import { DateHeaders, GroupHeaders, TimeHeaders } from "./Headers";
import { Blocks } from "./Blocks";
import { Tray } from "./Tray";

export default function Timetable({ violations, timeProvider = null }) {
  const dispatch = useDispatch();
  const { programs } = useSelector((state) => state.programs);

  const { table, userLevel } = useSelector((state) => state.auth);
  const client = useMemo(
    () => firestoreClientFactory.getClient(table),
    [table]
  );

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
