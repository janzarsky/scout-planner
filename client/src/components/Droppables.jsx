import React, { useCallback } from "react";
import { useMemo } from "react";
import { useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  useGetProgramsQuery,
  useUpdateProgramMutation,
} from "../store/programsApi";
import { firestoreClientFactory } from "../FirestoreClient";

export function Droppables({ settings }) {
  const data = useMemo(() => getDroppablesData(settings), [settings]);

  return data.map(({ key, x, y, begin, group }) => (
    <Droppable key={key} x={x} y={y} begin={begin} group={group} />
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
      }),
    ),
  );
}

export function BlockDroppables({ data }) {
  return data.map(({ key, x, y, begin, group }) => (
    <Droppable key={key} x={x} y={y} begin={begin} group={group} />
  ));
}

export function getBlockDroppablesData(
  width,
  height,
  blockBegin,
  timeStep,
  groupId,
) {
  return [...Array(width).keys()].flatMap((x) =>
    [...Array(height).keys()].map((y) => ({
      key: `${x}-${y}`,
      x: x + 1,
      y: y + 1,
      begin: blockBegin + x * timeStep,
      group: groupId,
    })),
  );
}

function Droppable({ x, y, begin, group }) {
  const { table } = useSelector((state) => state.auth);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);
  const navigate = useNavigate();
  const onDrop = useDroppableDrop();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) =>
        onDrop(item, begin, group, programsLoaded ? programs : []),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [programs],
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

export function useDroppableDrop() {
  const { table } = useSelector((state) => state.auth);

  const client = useMemo(
    () => firestoreClientFactory.getClient(table),
    [table],
  );
  const [updateProgramMutation] = useUpdateProgramMutation();

  return useCallback(
    (item, begin, groupId, currentPrograms) => {
      var prog = currentPrograms.find((program) => program._id === item.id);
      if (prog) {
        // single-group programs should be always updated according to the target group,
        // multi-group programs should be only updated in case they are dragged to a new group
        const groups =
          !groupId || prog.groups.indexOf(groupId) !== -1
            ? prog.groups
            : [groupId];

        updateProgramMutation({
          table,
          data: { ...prog, begin, groups, blockOrder: 0 },
        });
      }
    },
    [client],
  );
}
