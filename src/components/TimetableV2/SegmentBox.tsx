import React, { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import {
  HoverStatus,
  Segment,
  Violation,
  Lines,
  DEFAULT_PROGRAM_COLOR,
} from "./types";
import { usePeople, usePkgs } from "./hooks";
import { isColorDark } from "../../helpers/isColorDark";

interface SegmentBoxProps {
  segment: Segment;
  earliestTime: Temporal.PlainTime;
  latestTime: Temporal.PlainTime;
  isHovering: HoverStatus;
  isDragged?: boolean;
  setHovering: (isHovering: HoverStatus) => void;
  dayIndex: number;
  onDragStart: (ratio: number) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onContextMenu?: (x: number, y: number) => void;
  editable: boolean;
  isHighlighted: boolean | null;
  violations: Violation[];
  lines: Lines;
}

export function SegmentBox({
  segment,
  earliestTime,
  latestTime,
  isHovering,
  isDragged = false,
  setHovering,
  dayIndex,
  onDragStart,
  onDragEnd,
  onClick,
  onContextMenu,
  editable,
  isHighlighted,
  violations,
  lines,
}: SegmentBoxProps) {
  const program = segment.plannable;
  const dayLength = earliestTime.until(latestTime);
  const setStartTime = segment.start ?? earliestTime;
  const startTime =
    Temporal.PlainTime.compare(setStartTime, earliestTime) < 0
      ? earliestTime
      : setStartTime;
  const startOffset =
    earliestTime.until(startTime).total({ unit: "seconds" }) /
    dayLength.total({ unit: "seconds" });
  const setEndTime = segment.end ?? latestTime;
  const endTime =
    Temporal.PlainTime.compare(setEndTime, latestTime) > 0
      ? latestTime
      : setEndTime;
  const duration = startTime.until(endTime);
  const relativeDuration =
    duration.total({ unit: "seconds" }) / dayLength.total({ unit: "seconds" });

  const [clickWidthRatio, setClickWidthRatio] = useState(0);

  if (dayIndex < 0) {
    return null;
  }
  const line = lines[dayIndex];
  const linesInDayBeforeGroup = line.groups
    .slice(0, segment.atendeeGroups[0])
    .reduce((acc, it) => acc + it.concurrentLines, 0);
  const blockOrdersBefore = segment.blockOrders[0][0];
  const linesSpan = segment.atendeeGroups.reduce((acc, groupIdx, idx) => {
    const blocks = segment.blockOrders[idx].length;
    return acc + blocks;
  }, 0);

  const pkgs = usePkgs();
  const pkg = pkgs.find((pkg) => pkg._id === segment.plannable.pkg);
  const color = pkg?.color ?? DEFAULT_PROGRAM_COLOR;
  const isDark = color !== null && isColorDark(color);

  // Format to name1, name2, name3 (optionalname1, optionalname2)
  const people = usePeople();
  const owners = segment.plannable.people.map((person) => ({
    name: people.find((p) => p._id === person.person)?.name ?? person.person,
    optional: person.optional,
  }));
  const nonOptionalOwners = owners.filter((owner) => !owner.optional);
  const optionalOwners = owners.filter((owner) => owner.optional);
  const ownersString = nonOptionalOwners.map((owner) => owner.name).join(", ");
  const optionalOwnersString = optionalOwners
    .map((owner) => owner.name)
    .join(", ");
  const ownersStr =
    ownersString + (optionalOwnersString ? ` (${optionalOwnersString})` : "");

  const MIME_TYPE = "application/prs.plannable";

  return (
    <div
      className={[
        "scheduleTable__plannable",
        isHovering != null && "scheduleTable__plannable--hovering",
        isDragged && "scheduleTable__plannable--dragged",
        segment.start?.equals(startTime) && "scheduleTable__plannable--start",
        segment.end?.equals(endTime) && "scheduleTable__plannable--end",
        isDark && "scheduleTable__plannable--dark",
        isHighlighted && "scheduleTable__plannable--highlighted",
        isHighlighted === false && "scheduleTable__plannable--notHighlighted",
        violations.length > 0 && "scheduleTable__plannable--violated",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--segment-start": startOffset,
          "--segment-duration": relativeDuration,
          "--segment-color": color,
          "--segment-line-start":
            line.offset + linesInDayBeforeGroup + blockOrdersBefore,
          "--segment-line-span": linesSpan,
        } as any
      }
      onMouseEnter={(e) =>
        setHovering({ clientX: e.clientX, clientY: e.clientY })
      }
      onMouseMove={(e) =>
        setHovering({ clientX: e.clientX, clientY: e.clientY })
      }
      onMouseLeave={() => setHovering(null)}
      {...(editable
        ? {
            draggable: true,
            onDragStart: (e) => {
              e.dataTransfer.setData(MIME_TYPE, program._id as string);
              e.dataTransfer.effectAllowed = "move";

              const canvas = document.createElement("canvas");
              canvas.width = canvas.height = 0;
              e.dataTransfer.setDragImage(canvas, 25, 25);

              onDragStart(clickWidthRatio);
            },
            onDragEnd: () => {
              onDragEnd();
            },
            onMouseDown: (e) => {
              if (segment.start !== null && segment.end !== null) {
                setClickWidthRatio(
                  e.nativeEvent.offsetX / e.currentTarget.offsetWidth,
                );
              } else {
                setClickWidthRatio(0);
              }
            },
          }
        : {})}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onContextMenu={
        onContextMenu
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onContextMenu?.(e.clientX, e.clientY);
            }
          : undefined
      }
    >
      <div className="scheduleTable__plannableTitle">
        {program.locked && <i className="fa fa-lock me-1" />}
        {violations.length > 0 && (
          <i className="fa fa-exclamation-triangle me-1" />
        )}
        {program.title}
      </div>
      {ownersStr.length > 0 && (
        <div className="scheduleTable__plannableOwners">{ownersStr}</div>
      )}
      {isHovering != null && !isDragged && (
        <div
          className="scheduleTable__plannableExpansion"
          style={
            {
              "--position-x": `${isHovering.clientX}px`,
              "--position-y": `${isHovering.clientY}px`,
            } as any
          }
        >
          <div className="scheduleTable__plannableTitle">{program.title}</div>
          {violations.length > 0 && (
            <div className="scheduleTable__plannableOwners">
              <i className="fa fa-exclamation-triangle me-1" />
              {violations.map((violation) => violation.msg).join(", ")}
            </div>
          )}
          <div className="scheduleTable__plannableOwners">
            {pkg?.name ?? "Bez balíčku"}
          </div>
          {ownersStr.length > 0 && (
            <div className="scheduleTable__plannableOwners">{ownersStr}</div>
          )}
          <div className="scheduleTable__plannableOwners">
            {startTime.toLocaleString("cs-CZ", {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {endTime.toLocaleString("cs-CZ", {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            ({duration.total({ unit: "minute" })} min)
          </div>
        </div>
      )}
    </div>
  );
}
