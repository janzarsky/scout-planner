import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";
import { formatTime } from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import {
  addProgram,
  updateProgram,
  useGetProgramsSlice,
} from "../store/programsSlice";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { arraysIntersect } from "../helpers/Sorting";
import { useCommandHandler } from "./CommandContext";
import { useGetPeopleSlice } from "../store/peopleSlice";
import { DEFAULT_TIME_STEP, useGetSettingsSlice } from "../store/settingsSlice";
import { useGetPackagesQuery } from "../store/packagesApi";

export default function Program({ program, rect, violations }) {
  const { table, userLevel } = useSelector((state) => state.auth);

  const { data: packages, isSuccess: packagesLoaded } =
    useGetPackagesQuery(table);
  const { data: settings, isSuccess: settingsLoaded } =
    useGetSettingsSlice(table);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsSlice(table);

  const client = firestoreClientFactory.getClient(table);

  const ref = useRef(null);

  const { dispatchCommand } = useCommandHandler();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "program",
    item: { id: program._id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "program",
      drop: (item) => {
        var otherProg = programsLoaded
          ? programs.find((program) => program._id === item.id)
          : null;

        if (otherProg) {
          const newProg = {
            ...program,
            groups: [...otherProg.groups],
            begin: otherProg.begin,
          };
          const newOtherProg = {
            ...otherProg,
            groups: [...program.groups],
            begin: program.begin,
          };
          dispatchCommand(client, updateProgram(newProg));
          dispatchCommand(client, updateProgram(newOtherProg));
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [],
  );

  drag(drop(ref));

  const timeStep = settingsLoaded ? settings.timeStep : DEFAULT_TIME_STEP;
  const narrow = program.duration <= 2 * timeStep;

  return (
    <div
      ref={userLevel < level.EDIT || program.locked ? null : ref}
      className={
        "program-wrapper " +
        (isDragging ? " dragged" : "") +
        (isOver ? " drag-over" : "")
      }
      style={{
        gridColumnStart: rect.x + 1,
        gridRowStart: rect.y + 1,
        gridColumnEnd: "span " + rect.width,
        gridRowEnd: "span " + rect.height,
      }}
    >
      <ProgramBody
        program={program}
        violations={violations}
        pkg={
          packagesLoaded ? packages.find((p) => p._id === program.pkg) : null
        }
        narrow={narrow}
      />
      <ProgramEdit programId={program._id} narrow={narrow} />
      {program.locked && <ProgramLock narrow={narrow} />}
      {!program.locked && userLevel >= level.EDIT && (
        <ProgramMove narrow={narrow} />
      )}
      {program.url && <ProgramUrl url={program.url} narrow={narrow} />}
      {userLevel >= level.EDIT && (
        <ProgramClone
          clone={() => dispatchCommand(client, addProgram(program))}
          narrow={narrow}
        />
      )}
    </div>
  );
}

function getHighlightStatus(pkg, people) {
  const {
    highlightingEnabled: pkgsEnabled,
    highlightedPackages: activePkgs,
    peopleEnabled,
    activePeople,
  } = useSelector((state) => state.view);

  const pkgHighlight = pkgsEnabled && activePkgs.indexOf(pkg) !== -1;

  const peopleHighlight =
    peopleEnabled &&
    people.length > 0 &&
    activePeople.length > 0 &&
    arraysIntersect(people, activePeople);

  return {
    highlighted: pkgHighlight || peopleHighlight,
    faded: !pkgHighlight && !peopleHighlight && (pkgsEnabled || peopleEnabled),
  };
}

function ProgramBody({ program, pkg, violations, narrow }) {
  const { highlighted, faded } = getHighlightStatus(
    program.pkg,
    program.people.map((attendance) => attendance.person),
  );
  const viewViolations = useSelector((state) => state.view.viewViolations);
  const { rangesEnabled, activeRange } = useSelector((state) => state.view);
  let rangeValue =
    activeRange && program.ranges ? program.ranges[activeRange] : 0;
  if (rangeValue === undefined) rangeValue = 0;

  return (
    <div
      className={
        "program" +
        (violations && viewViolations ? " violation" : "") +
        (highlighted ? " highlighted" : "") +
        (faded ? " faded" : "") +
        (rangesEnabled ? " range range-" + rangeValue : "") +
        (narrow ? " narrow" : "")
      }
      style={
        !highlighted && !rangesEnabled && pkg
          ? { backgroundColor: pkg.color }
          : {}
      }
    >
      <ProgramText
        programPeople={program.people}
        place={program.place}
        title={program.title}
        begin={program.begin}
        duration={program.duration}
        pkgName={pkg ? pkg.name : ""}
        violations={violations}
      />
    </div>
  );
}

function ProgramText({
  title,
  pkgName,
  begin,
  duration,
  programPeople,
  place,
  violations,
}) {
  const { viewPkg, viewTime, viewPeople, viewPlace, viewViolations } =
    useSelector((state) => state.view);
  return (
    <div className="program-text">
      {!isHidden(title) && <h3 className="program-title">{title}</h3>}
      {viewPkg && pkgName !== "" && !isHidden(pkgName) && (
        <div className="program-package">
          <i className="fa fa-folder-o" />
          &nbsp;
          {pkgName}
        </div>
      )}
      {viewTime && <ProgramTime begin={begin} end={begin + duration} />}
      {viewPlace && place && <ProgramPlace place={place} />}
      {viewPeople && programPeople.length > 0 && (
        <ProgramPeople programPeople={programPeople} violations={violations} />
      )}
      {viewViolations && violations && (
        <ProgramViolations violations={violations} />
      )}
    </div>
  );
}

function ProgramTime({ begin, end }) {
  return (
    <div className="program-time">
      <i className="fa fa-clock-o" />
      &nbsp;
      {formatTime(begin)}&ndash;
      {formatTime(end)}
    </div>
  );
}

function lookUpPeople(programPeople, allPeople) {
  return programPeople
    .map((attendance) => ({
      ...attendance,
      data: allPeople.find((person) => person._id === attendance.person),
    }))
    .filter((attendance) => attendance.data);
}

function ProgramPeople({ programPeople, violations }) {
  const viewViolations = useSelector((state) => state.view.viewViolations);
  const { table } = useSelector((state) => state.auth);
  const { data: people, isSuccess: peopleLoaded } = useGetPeopleSlice(table);

  const lookedUpPeople = lookUpPeople(
    programPeople,
    peopleLoaded ? people : [],
  );

  return (
    <div className="program-people">
      <i className="fa fa-user-o" />
      &nbsp;
      {[...lookedUpPeople]
        .sort((a, b) => {
          if (!a.optional && b.optional) return -1;
          if (a.optional && !b.optional) return 1;

          return a.data.name.localeCompare(b.data.name);
        })
        .map((attendance) => (
          <span
            key={attendance.person}
            className={
              (viewViolations &&
              violations &&
              violations.find(
                (violation) =>
                  violation.people &&
                  violation.people.indexOf(attendance.person) !== -1,
              )
                ? "program-violated"
                : "") + (attendance.optional ? " program-optional" : "")
            }
          >
            {attendance.data.name}
          </span>
        ))
        .reduce((accu, elem) => {
          return accu === null ? [elem] : [...accu, ", ", elem];
        }, null)}
    </div>
  );
}

function ProgramPlace({ place }) {
  return (
    <div className="program-place">
      <i className="fa fa-map-marker" />
      &nbsp;
      {place}
    </div>
  );
}

function ProgramViolations({ violations }) {
  return (
    <div className="program-violations">
      <i className="fa fa-exclamation-triangle" />
      &nbsp;
      {violations
        .filter((violation) => violation.msg)
        .map((violation) => violation.msg)
        .join(", ")}
    </div>
  );
}

function ProgramEdit({ programId, narrow }) {
  const userLevel = useSelector((state) => state.auth.userLevel);
  const navigate = useNavigate();

  return (
    <div
      className={"program-edit" + (narrow ? " narrow" : "")}
      onClick={() => navigate(`edit/${programId}`)}
    >
      {userLevel >= level.EDIT ? (
        <i className="fa fa-pencil" />
      ) : (
        <i className="fa fa-eye" />
      )}
    </div>
  );
}

function ProgramMove({ narrow }) {
  return (
    <div className={"program-move" + (narrow ? " narrow" : "")}>
      <i className="fa fa-arrows" />
    </div>
  );
}

function ProgramLock({ narrow }) {
  return (
    <div className={"program-lock" + (narrow ? " narrow" : "")}>
      <i className="fa fa-lock" />
    </div>
  );
}

function ProgramUrl({ url, narrow }) {
  return (
    <div className={"program-url" + (narrow ? " narrow" : "")}>
      <a href={url} rel="noopener noreferrer" target="_blank">
        <i className="fa fa-link" />
      </a>
    </div>
  );
}

function ProgramClone({ clone, narrow }) {
  return (
    <div
      className={"program-clone" + (narrow ? " narrow" : "")}
      onClick={clone}
    >
      <i className="fa fa-clone" />
    </div>
  );
}

function isHidden(programTitle) {
  return programTitle.length > 0 && programTitle[0] === "(";
}
