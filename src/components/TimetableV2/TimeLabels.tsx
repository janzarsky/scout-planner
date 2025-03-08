import React, { memo } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { Lines } from "./types";

interface TimeLabelsProps {
  earliestTime: Temporal.PlainTime;
  timeLabels: Temporal.PlainTime[];
  dayLength: Temporal.Duration;
  lines: Lines;
}

export const TimeLabels = memo(
  function TimeLabels({
    earliestTime,
    timeLabels,
    dayLength,
    lines,
  }: TimeLabelsProps) {
    const dayLengthInMinutes = dayLength.total({ unit: "minutes" });
    const timeLabelsWithOffset = timeLabels.map((label) => {
      const startOffset =
        earliestTime.until(label).total({ unit: "minutes" }) /
        dayLengthInMinutes;
      return {
        string: label.toString(),
        label: label.toLocaleString("cs-CZ", {
          hour: "numeric",
          minute: "2-digit",
        }),
        startOffset,
        isMajor: label.minute === 0,
      };
    });

    return (
      <>
        <div className="scheduleTable__timeLabels">
          {timeLabelsWithOffset.map(({ string, label, startOffset }) => (
            <div
              key={string}
              className={`scheduleTable__timeLabel`}
              style={{ "--time": startOffset } as any}
            >
              {label}
            </div>
          ))}
        </div>

        {timeLabelsWithOffset.map(({ string, startOffset, isMajor }) => (
          <div
            key={string}
            className={`scheduleTable__timeLine ${isMajor ? "scheduleTable__timeLine--major" : ""}`}
            style={
              {
                "--time": startOffset,
                "--lines-count": lines.reduce(
                  (acc, it) => acc + it.concurrentLines,
                  0,
                ),
              } as any
            }
          />
        ))}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.earliestTime.equals(nextProps.earliestTime) &&
      prevProps.timeLabels.length === nextProps.timeLabels.length &&
      prevProps.timeLabels.every((label, index) =>
        label.equals(nextProps.timeLabels[index]),
      ) &&
      prevProps.dayLength === nextProps.dayLength &&
      prevProps.lines.length === nextProps.lines.length &&
      prevProps.lines.every(
        (line, index) =>
          line.date.equals(nextProps.lines[index].date) &&
          line.offset === nextProps.lines[index].offset &&
          line.concurrentLines === nextProps.lines[index].concurrentLines &&
          line.groups.length === nextProps.lines[index].groups.length &&
          line.groups.every(
            (group, groupIndex) =>
              group.group === nextProps.lines[index].groups[groupIndex].group &&
              group.concurrentLines ===
                nextProps.lines[index].groups[groupIndex].concurrentLines,
          ),
      )
    );
  },
);
