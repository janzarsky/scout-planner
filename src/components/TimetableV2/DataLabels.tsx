import React, { Fragment } from "react";
import { Lines } from "./types";
import { useGroups } from "./hooks";

interface DataLabelsProps {
  lines: Lines;
}

export function DataLabels({ lines }: DataLabelsProps) {
  const groups = useGroups();

  return (
    <>
      {lines.map((line, index) => (
        <Fragment key={line.date.toString()}>
          <div
            className="scheduleTable__dayLabel"
            style={
              {
                "--day-offset": line.offset,
                "--lines-count": line.concurrentLines,
              } as any
            }
          >
            {line.date.toLocaleString("cs-CZ", {
              day: "numeric",
              month: "narrow",
              weekday: "short",
            })}
          </div>

          <div
            className="scheduleTable__day"
            style={
              {
                "--day-offset": line.offset,
                "--lines-count": line.concurrentLines,
              } as any
            }
            data-date={line.date.toString()}
          />

          {line.groups.map((group, groupIndex) => {
            const groupOffset = line.groups
              .slice(0, groupIndex)
              .reduce((acc, it) => acc + it.concurrentLines, 0);
            return (
              <div
                key={group.group ?? "virtual"}
                className="scheduleTable__groupLabel"
                style={
                  {
                    "--day-offset": line.offset,
                    "--group-index": groupOffset,
                    "--group-concurrent": group.concurrentLines,
                  } as any
                }
              >
                {group.group === null
                  ? null
                  : groups.find((it) => it._id === group.group)?.name}
              </div>
            );
          })}

          {index !== 0 && (
            <div
              className="scheduleTable__dayLine"
              style={
                {
                  "--day-offset": line.offset,
                  "--lines-count": line.concurrentLines,
                } as any
              }
            />
          )}
        </Fragment>
      ))}
    </>
  );
}
