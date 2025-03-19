import React from "react";
import { getOnlyDate, getOnlyTime } from "../helpers/DateUtils";

export function TimeIndicator({ x, y, height }) {
  return (
    <div
      className="timeindicator"
      style={{
        gridColumnStart: x + 3,
        gridRowStart: y + 2,
        gridRowEnd: "span " + height,
      }}
    ></div>
  );
}

export function getTimeIndicatorRect(settings, now) {
  // the times in timetable are in UTC (we don't know the timezone of the actual event)
  // the indicator assumes that you are in the correct timezone
  const zoneAdjust = now - new Date(now).getTimezoneOffset() * 60 * 1000;

  const currTime = getOnlyTime(zoneAdjust);
  if (currTime < settings.dayStart || currTime > settings.dayEnd) return null;

  const currDate = getOnlyDate(zoneAdjust);
  if (settings.days.indexOf(currDate) === -1) return null;

  return {
    x: Math.ceil((currTime - settings.dayStart) / settings.timeStep),
    y: settings.days.indexOf(currDate) * settings.groupCnt,
    height: settings.groupCnt,
  };
}
