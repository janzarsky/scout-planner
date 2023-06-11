import { useMemo } from "react";
import { useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function Droppables({ settings, onDrop }) {
  const data = useMemo(() => getDroppablesData(settings), [settings]);

  return data.map(({ key, x, y, begin, group }) => (
    <Droppable
      key={key}
      x={x}
      y={y}
      begin={begin}
      group={group}
      onDrop={onDrop}
    />
  ));
}

function getDroppablesData(settings) {
  // ensure there is always at least one group
  const groups = settings.groups.length > 0 ? settings.groups : [{ _id: null }];

  return settings.days.flatMap((date, idxDate) =>
    settings.timeHeaders.flatMap((time, idxTime) =>
      [...Array(settings.timeSpan).keys()].flatMap((idxSpan) => {
        const begin = date + time + idxSpan * settings.timeStep;

        return groups.map((group, idxGroup) => ({
          key: `${begin}-${group._id}`,
          x: 3 + idxTime * settings.timeSpan + idxSpan,
          y: 2 + idxDate * settings.groupCnt + idxGroup,
          begin,
          group: group._id,
        }));
      })
    )
  );
}

export function Droppable({ onDrop, x, y, begin, group }) {
  const { programs } = useSelector((state) => state.programs);
  const navigate = useNavigate();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => onDrop(item, begin, group, programs),
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
      onClick={() => navigate("add", { state: { begin, groupId: group } })}
    />
  );
}
