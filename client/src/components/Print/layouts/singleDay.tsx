import React, { useMemo } from "react";
import { PrintLayout } from "./types";
import { Temporal } from "@js-temporal/polyfill";
import {
  getProgramDates,
  useGroups,
  usePkgs,
  usePrograms,
} from "../../TimetableV2/hooks";
import { epochMillisecondsToPlainDateTime } from "../../TimetableV2/utils";
import { ScheduledProgram } from "../../TimetableV2/types";

interface SingleDayOptions {
  date?: Temporal.PlainDate;
  boldPkgs: (string | null)[];
}

type SingleDayValidOptions = SingleDayOptions;


const timetable: PrintLayout<SingleDayOptions, SingleDayValidOptions> = {
  label: "Na den",
  initialOptions: {
    date: undefined,
    boldPkgs: [],
  },
  OptionsComponent: ({ options, setOptions }) => {
    const days = getProgramDates();
    const packages = usePkgs();
    const day = options.date;

    return (
      <>
        <div className="mb-3">
          <label htmlFor="day">Den:</label>

          <div className="d-flex flex-row gap-3 flex-wrap">
            <div className="form-check">
              <input
                type="radio"
                name="day"
                id="allDays"
                value="allDays"
                className="form-check-input"
                checked={!day}
                onChange={() => {
                  setOptions((prevOptions) => ({
                    ...prevOptions,
                    date: undefined,
                  }));
                }}
              />
              <label htmlFor="allDays" className="form-check-label">
                Všechny dny
              </label>
            </div>

            {days.map((dayOption) => (
              <div key={dayOption.toString()} className="form-check">
                <input
                  type="radio"
                  name="day"
                  id={dayOption.toString()}
                  value={dayOption.toString()}
                  className="form-check-input"
                  checked={day?.equals(dayOption)}
                  onChange={() => {
                    setOptions((prevOptions) => ({
                      ...prevOptions,
                      date: dayOption,
                    }));
                  }}
                />
                <label
                  htmlFor={dayOption.toString()}
                  className="form-check-label"
                >
                  {dayOption.toLocaleString("cs-CZ", {
                    day: "numeric",
                    month: "long",
                    weekday: "long",
                  })}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="boldPkgs">Zvýraznit balíčky:</label>
          <div className="d-flex flex-row gap-3 flex-wrap">
            <div className="form-check">
              <input
                type="checkbox"
                id="nullPkg"
                name="boldPkgs"
                className="form-check-input"
                checked={options.boldPkgs.includes(null)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setOptions((prevOptions) => ({
                    ...prevOptions,
                    boldPkgs: checked
                      ? [...prevOptions.boldPkgs, null]
                      : prevOptions.boldPkgs.filter((g) => g !== null),
                  }));
                }}
              />
              <label htmlFor="nullPkg" className="form-check-label">
                Bez balíčku
              </label>
            </div>

            {packages.map((pkg) => (
              <div key={pkg._id} className="form-check">
                <input
                  type="checkbox"
                  id={pkg._id}
                  name="boldPkgs"
                  value={pkg._id}
                  className="form-check-input"
                  checked={options.boldPkgs.includes(pkg._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setOptions((prevOptions) => ({
                      ...prevOptions,
                      boldPkgs: checked
                        ? [...prevOptions.boldPkgs, pkg._id]
                        : prevOptions.boldPkgs.filter((g) => g !== pkg._id),
                    }));
                  }}
                />
                <label htmlFor={pkg._id} className="form-check-label">
                  {pkg.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  },
  validateOptions: (
    options: SingleDayOptions,
  ): options is SingleDayValidOptions => true,
  PrintComponent: ({
    options: { date, boldPkgs },
  }) => {
    const allDays = getProgramDates();
    const days = date ? [date] : allDays;

    return (
      <>
        {days.map((day) => (
          <PrintDay
            key={day.toString()}
            date={day}
            boldPkgs={boldPkgs}
          />
        ))}
      </>
    );
  },
};

const PrintDay: React.FC<
  SingleDayValidOptions & { date: Temporal.PlainDate }
> = ({ date, boldPkgs }) => {
  const allPrograms = usePrograms();
  const programs: ScheduledProgram[] = useMemo(() => {
    return allPrograms.filter((program): program is ScheduledProgram => {
      // Do not show unscheduled programs
      if (!program.begin) {
        return false;
      }

      // Filter by date
      const begin = epochMillisecondsToPlainDateTime(program.begin);
      if (!begin.toPlainDate().equals(date)) {
        return false;
      }

      return true;
    });
  }, [allPrograms, date]);

  const programTimes = useMemo(() => {
    const set: Temporal.PlainTime[] = [];
    const addToSet = (time: Temporal.PlainTime) => {
      if (!set.some((t) => t.equals(time))) {
        set.push(time);
      }
    };
    for (const program of programs) {
      const begin = epochMillisecondsToPlainDateTime(program.begin);
      const start = begin;
      addToSet(start.toPlainTime());
      const end = start.add({ milliseconds: program.duration });
      if (end.toPlainDate().equals(start.toPlainDate())) {
        addToSet(end.toPlainTime());
      } else {
        addToSet(new Temporal.PlainTime(23, 59, 59, 0, 0));
      }
    }
    return Array.from(set).sort(Temporal.PlainTime.compare);
  }, [programs]);

  const definedGroups = useGroups();
  const groups = useMemo(() => {
    // If no groups are defined, show a single group
    if (definedGroups.length === 0) {
      return [{
        _id: "",
        order: 0,
        name: "",
      }];
    }
    return definedGroups;
  }, [definedGroups, programs]);

  return (
    <div className="singleDayPrint">
      <h2 className="singleDayPrint__title">
        {date.toLocaleString("cs-CZ", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h2>
      <div
        className="singleDayPrint__wrapper"
        style={
          {
            "--group-count": groups.length,
          } as React.CSSProperties
        }
      >
        {groups.map((group, groupIdx) => (
          <React.Fragment key={group._id}>
            {/* Heading */}
            <div
              className="singleDayPrint__groupHeader"
              style={
                {
                  "--column": groupIdx * 2 + 1,
                } as React.CSSProperties
              }
            >
              {group.name}
            </div>

            {/* Programs */}
            {programs
              .filter((program) => program.groups.includes(group._id) || program.groups.length === 0)
              .map((program) => {
                const begin = epochMillisecondsToPlainDateTime(program.begin);
                const start = begin.toPlainTime();
                const endFull = begin.add({ milliseconds: program.duration });
                const end = begin.toPlainDate().equals(endFull.toPlainDate())
                  ? endFull.toPlainTime()
                  : new Temporal.PlainTime(23, 59, 59, 0, 0);

                const startOffset = programTimes.findIndex((time) =>
                  time.equals(start),
                );
                const endOffset = programTimes.findIndex((time) =>
                  time.equals(end),
                );

                const isBold = boldPkgs.includes(program.pkg);

                return (
                  <div
                    key={program._id + group._id}
                    className={`singleDayPrint__program ${isBold ? "singleDayPrint__program--bold" : ""}`}
                    style={
                      {
                        "--start-offset": startOffset + 2,
                        "--end-offset": endOffset + 2,
                        "--column": groupIdx * 2 + 1,
                      } as React.CSSProperties
                    }
                  >
                    <div>{program.title}</div>
                  </div>
                );
              })}

            {/* Time column */}
            {(groups.length == 1 || groupIdx != groups.length - 1) && (
              <>
                <div
                  className="singleDayPrint__timeHeader"
                  style={
                    {
                      "--column": groupIdx * 2 + 2,
                    } as React.CSSProperties
                  }
                />

                {programTimes.map(
                  (time, timeIdx) =>
                    timeIdx !== programTimes.length - 1 && (
                      <div
                        key={time.toString()}
                        className="singleDayPrint__time"
                        style={
                          {
                            "--start-offset": timeIdx + 2,
                            "--end-offset": timeIdx + 2,
                            "--column": groupIdx * 2 + 2,
                          } as React.CSSProperties
                        }
                      >
                        {time.toLocaleString("cs-CZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {programTimes[timeIdx + 1].toLocaleString("cs-CZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    ),
                )}
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default timetable;
