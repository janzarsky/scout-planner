import React from "react";
import { Temporal } from "@js-temporal/polyfill";
import { Program } from "./types";
import { usePkg } from "./hooks";
import { epochMillisecondsToPlainDateTime } from "./utils";
import { useProgramPeopleString } from "./helperHooks";

interface HoveringInfoProps {
  program: Program;
  violations: { msg: string }[];
  screenLocation: { clientX: number; clientY: number };
}

export function HoveringInfo({
  program,
  violations,
  screenLocation: isHovering,
}: HoveringInfoProps) {
  const pkg = usePkg(program.pkg);
  const duration = Temporal.Duration.from({ milliseconds: program.duration });
  const startTime = program.begin
    ? epochMillisecondsToPlainDateTime(program.begin)
    : undefined;
  const ownersStr = useProgramPeopleString(program);

  return (
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
        {startTime && (
          <>
            {startTime.toLocaleString("cs-CZ", {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {startTime.add(duration).toLocaleString("cs-CZ", {
              hour: "numeric",
              minute: "2-digit",
            })}{" "}
            ({duration.total({ unit: "minute" })} min)
          </>
        )}
      </div>
    </div>
  );
}
