import React from "react";
import { Temporal } from "@js-temporal/polyfill";
import { Lines } from "./types";

interface TimeLabelsProps {
  earliestTime: Temporal.PlainTime;
  timeLabels: Temporal.PlainTime[];
  dayLength: Temporal.Duration;
  lines: Lines;
}

export function TimeLabels({
  earliestTime,
  timeLabels,
  dayLength,
  lines,
}: TimeLabelsProps) {
  return (
    <>
      <div className="scheduleTable__timeLabels">
        {timeLabels.map((label) => {
          const startOffset =
            earliestTime.until(label).total({ unit: "minutes" }) /
            dayLength.total({ unit: "minutes" });
          return (
            <div
              key={label.toString()}
              className={`scheduleTable__timeLabel`}
              style={{ "--time": startOffset } as any}
            >
              {label.toLocaleString("cs-CZ", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          );
        })}
      </div>

      {timeLabels.map((label) => {
        const startOffset =
          earliestTime.until(label).total({ unit: "minutes" }) /
          dayLength.total({ unit: "minutes" });
        const isMajor = label.minute === 0;
        return (
          <div
            key={label.toString()}
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
        );
      })}
    </>
  );
}
