import React, { Fragment, useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PROGRAM_COLOR,
  HoverStatusExtended,
  Lines,
  LOCAL_TIMEZONE,
  MIME_TYPE,
  Program,
  ScheduledProgram,
  Segment,
  UnscheduledProgram,
  Violations,
} from "./types";
import {
  useAddProgram,
  useGroups,
  usePeople,
  usePkgs,
  usePrograms,
  useUpdateProgram,
} from "./hooks";
import { Temporal } from "@js-temporal/polyfill";
import {
  epochMillisecondsToPlainDateTime,
  groupNeighbours,
  isProgramHighlighted,
} from "./utils";
import { maxTime, minTime } from "../../helpers/timeCompare";
import { useNavigate } from "react-router";
import { TimeLabels } from "./TimeLabels";
import { DataLabels } from "./DataLabels";
import { SegmentBox } from "./SegmentBox";
import { Button } from "react-bootstrap";
import { isColorDark } from "../../helpers/isColorDark";

interface ComposeScheduleProps {
  editable: boolean;
  violations: Violations;
  printView: boolean;
}

export const ComposeSchedule = ({
  editable,
  violations,
  printView,
}: ComposeScheduleProps) => {
  const [widthScale, setWidthScale] = useState(1);

  // Programs
  const programs = usePrograms();
  const scheduledPlannables = useMemo(() => {
    return programs.filter((it): it is ScheduledProgram => it.begin !== null);
  }, [programs]);
  const notScheduledPlannables = useMemo(() => {
    return programs.filter((it): it is UnscheduledProgram => it.begin === null);
  }, [programs]);

  // Context menu
  const [contextMenu, setContextMenu] = useState<null | {
    x: number;
    y: number;
    id: string;
  }>(null);
  const contextMenuProgram = useMemo(() => {
    return programs.find((it) => it._id === contextMenu?.id);
  }, [programs, contextMenu]);

  // All dates of the schedule
  const dates = useMemo(() => {
    const scheduledDateTimes = scheduledPlannables.map(
      (program): [Temporal.PlainDateTime, Temporal.Duration] => [
        epochMillisecondsToPlainDateTime(program.begin),
        Temporal.Duration.from({ milliseconds: program.duration }),
      ],
    );

    // Find the first and last date of the schedule
    let [firstDate, lastDate] = scheduledDateTimes.reduce<
      [Temporal.PlainDate | null, Temporal.PlainDate | null]
    >(
      ([firstDate, lastDate], [start, duration]) => {
        const startPlain = start.toPlainDate();
        const endPlain = start.add(duration).toPlainDate();
        return [
          firstDate === null ||
          Temporal.PlainDate.compare(startPlain, firstDate) < 0
            ? startPlain
            : firstDate,
          lastDate === null ||
          Temporal.PlainDate.compare(endPlain, lastDate) > 0
            ? endPlain
            : lastDate,
        ];
      },
      [null, null],
    );

    // If there are no scheduled programs, show only the current date
    if (firstDate === null || lastDate === null) {
      return [Temporal.Now.plainDateISO(LOCAL_TIMEZONE)];
    }

    // Start one day before the first date and end one day after the last date
    firstDate = firstDate.subtract({ days: 1 });
    lastDate = lastDate.add({ days: 1 });

    // Get all dates between the first and last date
    let last = firstDate;
    const dates = [last];
    while (Temporal.PlainDateTime.compare(last, lastDate) < 0) {
      last = last.add(Temporal.Duration.from({ days: 1 }));
      dates.push(last);
    }
    return dates;
  }, [scheduledPlannables]);

  const atendeeGroups = useGroups();

  // Show virtual group on the top, if there are no groups or if there are programs without groups
  const hasAtLeastOneGroup = atendeeGroups.length > 0;
  const programsWithoutGroups = scheduledPlannables.filter(
    (it) => it.groups.length === 0,
  );
  const showVirtualGroup =
    !hasAtLeastOneGroup || programsWithoutGroups.length > 0;
  const shownGroups: [null | string, ...string[]] = useMemo(() => {
    const sortedAttendeGroupIds = atendeeGroups.map((it) => it._id);
    return showVirtualGroup
      ? [null, ...sortedAttendeGroupIds]
      : (sortedAttendeGroupIds as [string, ...string[]]); // safe cast because showVirtualGroup is false, so there is at least one group
  }, [atendeeGroups, showVirtualGroup]);

  // Owner filtering
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);
  const people = usePeople();
  const availableOwners = useMemo(() => {
    const result: { id: string; name: string; count: number }[] = [];
    for (const program of programs) {
      for (const { person: ownerId } of program.people) {
        let ownerRecord = result.find((it) => it.id === ownerId);
        if (!ownerRecord) {
          const person = people.find((it) => it._id === ownerId);
          if (!person) {
            continue;
          }
          ownerRecord = { id: ownerId, name: person.name, count: 0 };
          result.push(ownerRecord);
        }
        ownerRecord!.count++;
      }
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [programs, people]);

  // Package filtering
  const [packageFilter, setPackageFilter] = useState<string | null>(null);
  const programmeGroups = usePkgs();
  const availablePackages = useMemo(() => {
    const result = programmeGroups.map((it) => ({
      id: it._id,
      name: it.name,
      color: it.color,
      count: 0,
    }));

    for (const program of programs) {
      if (!program.pkg) {
        continue;
      }
      const packageRecord = result.find((it) => it.id === program.pkg);
      if (packageRecord) {
        packageRecord.count++;
      }
    }

    return result;
  }, [programs, programmeGroups]);

  const concurrentBlocksMap = useMemo(() => {
    // Get all unique blockOrder for each date and atendee group
    const blockOrdersByDateAndGroup = new Map<
      string,
      Map<string | null, number[]>
    >();
    for (const program of scheduledPlannables) {
      const start = epochMillisecondsToPlainDateTime(program.begin);
      const end = start.add({ milliseconds: program.duration });
      const days = [start.toPlainDate()];
      if (!start.equals(end.toPlainDate())) {
        days.push(end.toPlainDate());
      }

      for (const date of days) {
        const groups = program.groups.length === 0 ? [null] : program.groups;
        for (const group of groups) {
          const d = date.toString();
          if (!blockOrdersByDateAndGroup.has(d)) {
            blockOrdersByDateAndGroup.set(d, new Map());
          }
          const dateMap = blockOrdersByDateAndGroup.get(d)!;
          if (!dateMap.has(group)) {
            dateMap.set(group, []);
          }
          const groupSet = dateMap.get(group)!;
          if (!groupSet.includes(program.blockOrder)) {
            groupSet.push(program.blockOrder);
            groupSet.sort();
          }
        }
      }
    }

    // Ensure that all dates and groups are present (even if there are no programs)
    for (const date of dates) {
      const d = date.toString();
      if (!blockOrdersByDateAndGroup.has(d)) {
        blockOrdersByDateAndGroup.set(d, new Map());
      }
      const dateMap = blockOrdersByDateAndGroup.get(d)!;
      for (const group of shownGroups) {
        if (!dateMap.has(group)) {
          dateMap.set(group, [0]);
        }
      }
    }

    return blockOrdersByDateAndGroup;
  }, [scheduledPlannables, dates, shownGroups]);

  const createSegmentsForPlannable = useCallback(
    function <T extends Program>(
      plannable: T,
      opts: T extends ScheduledProgram
        ? { start?: Temporal.PlainDateTime }
        : { start: Temporal.PlainDateTime },
    ): Segment[] {
      const start =
        opts?.start ?? epochMillisecondsToPlainDateTime(plannable.begin!);
      const duration = Temporal.Duration.from({
        milliseconds: plannable.duration,
      });
      const end = start.add(duration);

      const shownInGroups: Array<null | string> =
        plannable.groups.length === 0 ? [null] : plannable.groups;

      // Find all dates between start and end (inclusive)
      let endDate = start.toPlainDate();
      const dates = [endDate];
      while (!endDate.equals(end.toPlainDate())) {
        endDate = endDate.add({ days: 1 });
        dates.push(endDate);
      }

      return dates.flatMap((date, dateIndex) => {
        const startOnDay = dateIndex === 0 ? start.toPlainTime() : null;
        const endOnDay =
          dateIndex === dates.length - 1 ? end.toPlainTime() : null;

        const dateStart = (
          startOnDay ?? Temporal.PlainTime.from("00:00")
        ).toPlainDateTime(date);
        const dateEnd = (
          endOnDay ??
          Temporal.PlainTime.from("00:00").subtract({ nanoseconds: 1 })
        ).toPlainDateTime(date);

        // Span over block order (concurrent blocks)
        const mapForDate =
          concurrentBlocksMap.get(date.toString()) ?? new Map();

        // All block in the same time and same groups, but with different block order
        const concurrentBlocks = scheduledPlannables.filter((it) => {
          const start = epochMillisecondsToPlainDateTime(it.begin);
          const end = start.add({ milliseconds: it.duration });
          return (
            Temporal.PlainDateTime.compare(dateStart, end) < 0 &&
            Temporal.PlainDateTime.compare(dateEnd, start) > 0 &&
            it.groups.some((group) => shownInGroups.includes(group)) &&
            it._id !== plannable._id &&
            it.blockOrder !== plannable.blockOrder
          );
        });

        const shownGroupsIndices = shownInGroups.map((groupId) =>
          shownGroups.indexOf(groupId),
        );
        const mapForDayByGroupIdxToBlockOrder = new Map(
          Array.from(mapForDate.entries()).map(
            ([group, blockOrders]): [number, number[]] => [
              shownGroups.indexOf(group),
              blockOrders,
            ],
          ),
        );
        const mapForDayByGroupIdxToBlockOrderIdx = new Map(
          Array.from(mapForDayByGroupIdxToBlockOrder.entries()).map(
            ([groupIdx, blockOrders]): [number, number[]] => [
              groupIdx,
              blockOrders.map((_, idx) => idx),
            ],
          ),
        );

        // If we have concurrent blocks, we split it into separate segments for each group
        if (concurrentBlocks.length > 0) {
          return shownGroupsIndices.map((groupIdx) => {
            let blockOrder = mapForDayByGroupIdxToBlockOrder
              .get(groupIdx)!
              .indexOf(plannable.blockOrder);

            if (blockOrder === -1) {
              blockOrder = 0;
            }

            return {
              plannable,
              date,
              start: startOnDay,
              end: endOnDay,
              atendeeGroups: [groupIdx],
              blockOrders: [[blockOrder]],
            };
          });
        }

        // If there are no concurrent blocks, we try to merge it into one segment
        const segmentsFromAtendeeGroups = groupNeighbours(shownGroupsIndices);
        return segmentsFromAtendeeGroups.map((atendeeGroups) => {
          return {
            plannable,
            date,
            start: startOnDay,
            end: endOnDay,
            atendeeGroups,
            blockOrders: atendeeGroups.map(
              (groupIdx) =>
                mapForDayByGroupIdxToBlockOrderIdx.get(groupIdx) ?? [0],
            ),
          };
        });
      });
    },
    [shownGroups, concurrentBlocksMap, scheduledPlannables],
  );

  const segments = useMemo(() => {
    return scheduledPlannables.flatMap((it) =>
      createSegmentsForPlannable(it, {}),
    );
  }, [scheduledPlannables, createSegmentsForPlannable]);

  const [draggingPlannable, setDraggingPlannable] = useState<{
    id: string;
    widthRatio?: number;
  } | null>(null);
  const [draggingPlannableStart, setDraggingPlannableStart] =
    useState<Temporal.PlainDateTime | null>(null);
  const shadowSegments = useMemo(() => {
    if (draggingPlannable === null || draggingPlannableStart === null) {
      return [];
    }
    const plannable = programs.find((it) => it._id === draggingPlannable.id)!;
    const draggedPlannableSegments = createSegmentsForPlannable(plannable, {
      start: draggingPlannableStart,
    });

    // Show swapped program
    const swappingPlannable = programs.filter(
      (it) =>
        it.begin ===
          draggingPlannableStart.toZonedDateTime(LOCAL_TIMEZONE).toInstant()
            .epochMilliseconds &&
        it.groups.length === plannable.groups.length &&
        it.groups.every((group) => plannable.groups.includes(group)) &&
        it.blockOrder === plannable.blockOrder,
    );
    const swappingPlannableSegments =
      swappingPlannable.length == 1
        ? createSegmentsForPlannable(swappingPlannable[0], {
            start: epochMillisecondsToPlainDateTime(plannable.begin!),
          })
        : [];

    return [...draggedPlannableSegments, ...swappingPlannableSegments];
  }, [
    draggingPlannable,
    draggingPlannableStart,
    programs,
    createSegmentsForPlannable,
  ]);

  const [earliestTime, latestTime] = useMemo(() => {
    const minSegmentShownDuration = Temporal.Duration.from({ minutes: 60 });

    const segmentStarts = segments
      .map((it) => it.start)
      .filter((it): it is Temporal.PlainTime => it !== null);
    const segmentEnds = segments
      .map((it) => it.end)
      .filter((it): it is Temporal.PlainTime => it !== null);

    const earliest = minTime(
      Temporal.PlainTime.from("08:00"),
      ...segmentStarts,
      ...segmentEnds,
      ...segmentEnds.map((it) => it.subtract(minSegmentShownDuration)),
    ).round({
      roundingIncrement: 30,
      smallestUnit: "minutes",
      roundingMode: "trunc",
    });

    const minLatest = Temporal.PlainTime.from("20:00");
    const endOfDay = Temporal.PlainTime.from("23:59");
    let latest = maxTime(
      minLatest,
      ...segmentStarts,
      ...segmentEnds,
      ...segmentStarts.map((it) => it.add(minSegmentShownDuration)),
    ).round({
      roundingIncrement: 30,
      smallestUnit: "minutes",
      roundingMode: "ceil",
    });

    if (
      Temporal.PlainTime.compare(minLatest, latest) == 1 ||
      Temporal.PlainTime.compare(
        latest,
        endOfDay.subtract(minSegmentShownDuration),
      ) == 1
    ) {
      // Some segment has wrapped over
      latest = endOfDay;
    }

    return [earliest, latest];
  }, [segments]);

  const dayLength = useMemo(() => {
    return earliestTime.until(latestTime);
  }, [earliestTime, latestTime]);

  const timeLabels = useMemo(() => {
    const timeStep = widthScale > 2.5 ? 5 : widthScale >= 1.1 ? 15 : 30;
    const dayMinutes = dayLength.total({ unit: "minutes" });
    const labels: Temporal.PlainTime[] = [];
    for (let i = 0; i <= dayMinutes; i += timeStep) {
      labels.push(earliestTime.add({ minutes: i }));
    }
    return labels;
  }, [earliestTime, dayLength, widthScale]);

  const [hoveringPlannable, setHoveringPlannable] =
    useState<HoverStatusExtended>(null);
  const ref = useRef<HTMLDivElement>(null);

  const getDateTimeForPosition = useCallback(
    (
      [clientX, clientY]: [number, number],
      minutesOffset: number = 0,
    ): Temporal.PlainDateTime | null => {
      for (const dayEl of ref.current?.querySelectorAll(
        ".scheduleTable__day",
      ) ?? []) {
        const rect = dayEl.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          const day = Temporal.PlainDate.from(dayEl.getAttribute("data-date")!);
          const alignTo = rect.width > 3000 ? 1 : 5;
          const relativeX = (clientX - rect.left) / rect.width;

          const time = earliestTime
            .add({
              minutes: Math.floor(
                relativeX * dayLength.total({ unit: "minutes" }) -
                  minutesOffset,
              ),
            })
            .round({
              roundingIncrement: alignTo,
              smallestUnit: "minutes",
              roundingMode: "floor",
            });
          return day.toPlainDateTime(time);
        }
      }
      return null;
    },
    [ref, dayLength, earliestTime],
  );

  const onDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (
        e.dataTransfer.types.includes(MIME_TYPE) &&
        draggingPlannable !== null
      ) {
        e.preventDefault();
        const widthRatio = draggingPlannable.widthRatio ?? 0;
        const plannable = programs.find(
          (it) => it._id === draggingPlannable.id,
        )!;
        const duration = Temporal.Duration.from({
          milliseconds: plannable.duration,
        });
        const offset = duration.total({ unit: "minutes" }) * widthRatio;
        setDraggingPlannableStart(
          getDateTimeForPosition([e.clientX, e.clientY], offset),
        );
      }
    },
    [
      setDraggingPlannableStart,
      earliestTime,
      draggingPlannable,
      programs,
      getDateTimeForPosition,
    ],
  );

  const updateProgram = useUpdateProgram();
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer.types.includes(MIME_TYPE)) {
        e.preventDefault();
        if (draggingPlannable === null || draggingPlannableStart === null) {
          return;
        }

        const plannable = programs.find(
          (it) => it._id === draggingPlannable.id,
        )!;
        const newBegin = draggingPlannableStart
          .toZonedDateTime(LOCAL_TIMEZONE)
          .toInstant().epochMilliseconds;
        updateProgram({
          ...plannable,
          begin: newBegin,
        });

        // Swap with the program that was at the same time
        const swappingPlannable = programs.filter(
          (it) =>
            it.begin === newBegin &&
            it.groups.length === plannable.groups.length &&
            it.groups.every((group) => plannable.groups.includes(group)) &&
            it.blockOrder === plannable.blockOrder,
        );
        if (swappingPlannable.length == 1) {
          updateProgram({
            ...swappingPlannable[0],
            begin: plannable.begin,
          });
        }

        setDraggingPlannable(null);
        setDraggingPlannableStart(null);
      }
    },
    [
      draggingPlannable,
      draggingPlannableStart,
      programs,
      setDraggingPlannable,
      setDraggingPlannableStart,
      updateProgram,
    ],
  );

  const onTrayDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer.types.includes(MIME_TYPE)) {
        e.preventDefault();
        setDraggingPlannableStart(null);
      }
    },
    [ref, setDraggingPlannableStart],
  );

  const onTrayDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (e.dataTransfer.types.includes(MIME_TYPE)) {
        e.preventDefault();
        if (draggingPlannable === null || draggingPlannableStart !== null) {
          return;
        }

        const plannable = programs.find(
          (it) => it._id === draggingPlannable.id,
        )!;
        updateProgram({
          ...plannable,
          begin: null,
        });
        setDraggingPlannable(null);
        setDraggingPlannableStart(null);
      }
    },
    [
      draggingPlannable,
      draggingPlannableStart,
      programs,
      setDraggingPlannable,
      setDraggingPlannableStart,
    ],
  );

  const navigate = useNavigate();

  const onCreateTrayItem = useCallback(() => {
    navigate("add");
  }, [navigate]);

  const onClickToCreate = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const start = getDateTimeForPosition([e.clientX, e.clientY]);
      if (!start) {
        return;
      }
      const begin = start
        .toZonedDateTime(LOCAL_TIMEZONE)
        .toInstant().epochMilliseconds;
      navigate("add", { state: { begin } });
    },
    [getDateTimeForPosition],
  );

  const addProgram = useAddProgram();
  const onCopy = useCallback(
    (id: string, times: number) => {
      const trayItem = programs.find((it) => it._id === id);
      if (!trayItem || !trayItem.begin) {
        return;
      }

      for (let i = 0; i < times; i++) {
        const originalStart = epochMillisecondsToPlainDateTime(trayItem.begin!);
        const newStart = originalStart
          .add({ days: i + 1 })
          .toZonedDateTime(LOCAL_TIMEZONE);
        addProgram({
          ...trayItem,
          _id: undefined,
          begin: newStart.toInstant().epochMilliseconds,
        });
      }
    },
    [addProgram, programs],
  );

  const setEditingTrayItem = useCallback(
    (programId: string) => {
      navigate(`edit/${programId}`);
    },
    [navigate],
  );

  const lines: Lines = useMemo(() => {
    const passZero = dates.map((date) => ({
      date: date,
      groups: shownGroups.map((group) => ({
        group: group,
        concurrentLines:
          concurrentBlocksMap.get(date.toString())?.get(group)?.length ?? 1,
      })),
    }));

    const passOne: Lines = [];
    let offset = 0;
    for (const line of passZero) {
      const concurrentLines = line.groups.reduce(
        (acc, it) => acc + it.concurrentLines,
        0,
      );
      passOne.push({ ...line, offset, concurrentLines });
      offset += concurrentLines;
    }

    return passOne;
  }, [dates, shownGroups, concurrentBlocksMap]);

  return (
    <div className="schedulePage scheme-light">
      <div className="schedulePage__mainContent">
        <div className="schedulePage__tableSegment">
          <div
            ref={ref}
            className="scheduleTable"
            style={
              {
                "--groups-count": shownGroups.length,
                "--days-count": dates.length,
                "--width-scale": widthScale,
              } as any
            }
            {...(editable
              ? {
                  onDragOver: onDragOver,
                  onDrop: onDrop,
                  onClick: onClickToCreate,
                }
              : {})}
          >
            <DataLabels lines={lines} />

            <TimeLabels
              earliestTime={earliestTime}
              timeLabels={timeLabels}
              dayLength={dayLength}
              lines={lines}
            />

            {[...segments].map((segment, index) => {
              return (
                <SegmentBox
                  key={index}
                  segment={segment}
                  earliestTime={earliestTime}
                  latestTime={latestTime}
                  isHovering={
                    hoveringPlannable?.id === segment.plannable._id
                      ? hoveringPlannable
                      : null
                  }
                  isDragged={draggingPlannable?.id === segment.plannable._id}
                  setHovering={(isHovering) =>
                    setHoveringPlannable(
                      isHovering
                        ? {
                            ...isHovering,
                            id: segment.plannable._id,
                          }
                        : null,
                    )
                  }
                  dayIndex={dates.findIndex((it) => it.equals(segment.date))}
                  onDragStart={(widthRatio) => {
                    setDraggingPlannable({
                      id: segment.plannable._id,
                      widthRatio,
                    });
                  }}
                  onDragEnd={() => {
                    setDraggingPlannable(null);
                    setDraggingPlannableStart(null);
                  }}
                  onClick={() => {
                    setEditingTrayItem(segment.plannable._id);
                  }}
                  onContextMenu={
                    !editable
                      ? undefined
                      : (x, y) => {
                          setContextMenu({
                            x,
                            y,
                            id: segment.plannable._id,
                          });
                        }
                  }
                  editable={editable && !segment.plannable.locked}
                  isHighlighted={isProgramHighlighted(
                    segment.plannable,
                    ownerFilter,
                    packageFilter,
                  )}
                  violations={violations.get(segment.plannable._id) ?? []}
                  lines={lines}
                />
              );
            })}

            {...shadowSegments.map((segment, index) => (
              <SegmentBox
                key={index}
                segment={segment}
                earliestTime={earliestTime}
                latestTime={latestTime}
                isHovering={null}
                setHovering={() => {}}
                dayIndex={dates.findIndex((it) => it.equals(segment.date))}
                onDragStart={(widthRatio) => {
                  setDraggingPlannable({
                    id: segment.plannable._id,
                    widthRatio,
                  });
                }}
                onDragEnd={() => {
                  setDraggingPlannable(null);
                  setDraggingPlannableStart(null);
                }}
                onClick={() => {
                  setEditingTrayItem(segment.plannable._id);
                }}
                editable={editable}
                isHighlighted={null}
                violations={violations.get(segment.plannable._id) ?? []}
                lines={lines}
              />
            ))}
          </div>
        </div>
        {!printView && (
          <div className="schedulePage__bottomControls">
            <div className="schedulePage__bottomControlsLeft">
              <label>
                Majitel programu:{" "}
                <select
                  value={ownerFilter ?? ""}
                  onChange={(e) => setOwnerFilter(e.target.value || null)}
                >
                  <option value="">Všichni</option>
                  {availableOwners.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.count})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Balíček:{" "}
                <select
                  value={packageFilter ?? ""}
                  onChange={(e) => setPackageFilter(e.target.value || null)}
                >
                  <option value="">Všechny</option>
                  {availablePackages.map((it) => (
                    <option
                      key={it.id}
                      value={it.id}
                      style={{ backgroundColor: it.color }}
                    >
                      {it.name} ({it.count})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="schedulePage__bottomControlsRight">
              <label>
                🔎
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={widthScale}
                  onChange={(e) => setWidthScale(parseFloat(e.target.value))}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {editable && (
        <div
          className="schedulePage__tray"
          onDragOver={onTrayDragOver}
          onDrop={onTrayDrop}
        >
          <div className="schedulePage_trayHeader">
            <h2 className="schedulePage_trayHeaderTitle">Odkladiště</h2>
            <Button
              onClick={onCreateTrayItem}
              variant="outline-primary"
              size="sm"
            >
              <i className="fa fa-plus"></i>
            </Button>
          </div>
          {notScheduledPlannables.map((plannable) => {
            const color =
              (plannable.pkg
                ? programmeGroups.find((it) => it._id === plannable.pkg)?.color
                : null) ?? DEFAULT_PROGRAM_COLOR;
            const isDark = color !== null ? isColorDark(color) : false;
            return (
              <div
                key={plannable._id}
                className={[
                  "schedulePage__traySegment",
                  isDark && "schedulePage__traySegment--dark",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  {
                    "--segment-color": color,
                  } as any
                }
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(MIME_TYPE, plannable._id as string);
                  e.dataTransfer.effectAllowed = "move";
                  setDraggingPlannable({ id: plannable._id });
                }}
                onClick={() => {
                  setEditingTrayItem(plannable._id);
                }}
              >
                {plannable.title}
              </div>
            );
          })}
        </div>
      )}

      {contextMenu && contextMenuProgram && (
        <div
          className="contextMenu__wrapper"
          onClick={() => {
            setContextMenu(null);
          }}
        >
          <div
            className="contextMenu"
            style={
              {
                "--position-x": `${contextMenu.x}px`,
                "--position-y": `${contextMenu.y}px`,
              } as any
            }
          >
            {contextMenuProgram.locked ? (
              <>
                <div
                  className="contextMenu__item"
                  onClick={() => {
                    setContextMenu(null);
                    updateProgram({ ...contextMenuProgram, locked: false });
                  }}
                >
                  Odemknout
                </div>
              </>
            ) : (
              <>
                <div
                  className="contextMenu__item"
                  onClick={() => {
                    setContextMenu(null);
                    onCopy(contextMenu.id, 1);
                  }}
                >
                  Opakovat další den
                </div>
                <div
                  className="contextMenu__item"
                  onClick={() => {
                    setContextMenu(null);
                    updateProgram({ ...contextMenuProgram, locked: true });
                  }}
                >
                  Zamknout
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
