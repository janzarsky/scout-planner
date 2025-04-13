import React, { useEffect, useState } from "react";
import { getOnlyDate, getOnlyTime } from "../helpers/DateUtils";

export function TimeIndicator({ settings, timeProvider, timeStep }) {
  const [time, setTime] = useState(timeProvider ? timeProvider() : Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setTime(timeProvider ? timeProvider() : Date.now()),
      (1000 * timeStep) / 2,
    );

    return () => clearInterval(interval);
  }, []);

  const rect = getTimeIndicatorRect(settings, time);

  if (!rect) return null;

  return (
    <div
      className="timeindicator"
      style={{
        gridColumnStart: rect.x + 3,
        gridRowStart: rect.y + 2,
        gridRowEnd: "span " + rect.height,
      }}
    ></div>
  );
}

function getTimeIndicatorRect(settings, now) {
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
