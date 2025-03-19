import React from "react";
import { formatDay } from "../helpers/DateUtils";

export function TimeHeaders({ settings }) {
  return settings.timeHeaders.map((time, idx) => (
    <TimeHeader
      key={time}
      time={new Date(time)}
      pos={idx * settings.timeSpan + 3}
      span={settings.timeSpan}
    />
  ));
}

function TimeHeader({ time, pos, span }) {
  return (
    <div
      className="timeheader"
      style={{
        gridColumnStart: pos,
        gridColumnEnd: "span " + span,
      }}
    >
      {time.getUTCHours()}
      <span className="timeheader-minutes">:00</span>
    </div>
  );
}

export function DateHeaders({ settings }) {
  return settings.days.map((date, idx) => (
    <DateHeader
      key={date}
      date={new Date(date)}
      pos={idx * settings.groupCnt + 2}
      span={settings.groupCnt}
    />
  ));
}

function DateHeader({ date, pos, span }) {
  return (
    <div
      className="dateheader"
      style={{
        gridRowStart: pos,
        gridRowEnd: "span " + span,
      }}
    >
      {formatDay(date.getTime())}
      <br />
      {date.getUTCDate()}.<br />
      {date.getUTCMonth() + 1}.
    </div>
  );
}

export function GroupHeaders({ settings }) {
  return settings.days.flatMap((date, idx) =>
    settings.groups.map((group, groupIdx) => (
      <GroupHeader
        key={`group,${date},${group._id}`}
        pos={idx * settings.groupCnt + groupIdx + 2}
        name={group.name}
      />
    )),
  );
}

function GroupHeader({ pos, name }) {
  return (
    <div className="groupheader" style={{ gridRowStart: pos }}>
      {name}
    </div>
  );
}
