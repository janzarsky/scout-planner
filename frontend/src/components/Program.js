import { useDrag, useDrop } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { formatTime } from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import {
  convertLegacyPeople,
  convertProgramPeople,
} from "../helpers/PeopleConvertor";
import { addError } from "../store/errorsSlice";
import { addProgram, updateProgram } from "../store/programsSlice";
import { useRef } from "react";

export default function Program({ program, rect, violations, onEdit }) {
  const { packages } = useSelector((state) => state.packages);
  const { programs } = useSelector((state) => state.programs);

  const { table, userLevel } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  const ref = useRef(null);

  const dispatch = useDispatch();

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
        var otherProg = programs.find((program) => program._id === item.id);

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
          dispatch(updateProgram(newProg));
          dispatch(updateProgram(newOtherProg));
          client
            .updateProgram(newProg)
            .catch((e) => dispatch(addError(e.message)));
          client
            .updateProgram(newOtherProg)
            .catch((e) => dispatch(addError(e.message)));
        }
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    []
  );

  drag(drop(ref));

  const clone = (p) =>
    client.addProgram(p).then(
      (resp) => dispatch(addProgram(resp)),
      (e) => dispatch(addError(e.message))
    );

  return (
    <div
      ref={program.locked ? null : ref}
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
        pkg={packages.find((p) => p._id === program.pkg)}
      />
      <ProgramEdit program={program} onEdit={onEdit} />
      {program.locked && <ProgramLock />}
      {!program.locked && userLevel >= level.EDIT && <ProgramMove />}
      {program.url && <ProgramUrl url={program.url} />}
      {userLevel >= level.EDIT && <ProgramClone clone={() => clone(program)} />}
    </div>
  );
}

function ProgramBody({ program, pkg, violations }) {
  const { highlighted, faded } = useSelector((state) => {
    const highlighted =
      state.view.highlightingEnabled &&
      state.view.highlightedPackages.indexOf(program.pkg) !== -1;
    const faded = state.view.highlightingEnabled && !highlighted;
    return { highlighted, faded };
  });
  const viewViolations = useSelector((state) => state.view.viewViolations);
  const { rangesEnabled, activeRange } = useSelector((state) => state.view);
  const timeStep = useSelector((state) => state.settings.settings.timeStep);
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
        (program.duration <= 2 * timeStep ? " narrow" : "")
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
  return programPeople.map((attendance) => ({
    ...attendance,
    data: allPeople.find((person) => person._id === attendance.person),
  }));
}

function ProgramPeople({ programPeople, violations }) {
  const viewViolations = useSelector((state) => state.view.viewViolations);
  const { legacyPeople, people } = useSelector((state) => state.people);

  const allPeople = convertLegacyPeople(legacyPeople, people);
  const convertedProgramPeople = convertProgramPeople(programPeople, allPeople);

  const lookedUpPeople = lookUpPeople(convertedProgramPeople, allPeople);

  return (
    <div className="program-people">
      <i className="fa fa-user-o" />
      &nbsp;
      {[...lookedUpPeople]
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
        .map((attendance) => (
          <span
            key={attendance.person}
            className={
              viewViolations &&
              violations &&
              violations.find(
                (violation) =>
                  violation.people &&
                  violation.people.indexOf(attendance.person) !== -1
              )
                ? "program-violated"
                : ""
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

function ProgramEdit({ onEdit, program }) {
  const userLevel = useSelector((state) => state.auth.userLevel);

  return (
    <div className="program-edit" onClick={() => onEdit(program)}>
      {userLevel >= level.EDIT ? (
        <i className="fa fa-pencil" />
      ) : (
        <i className="fa fa-eye" />
      )}
    </div>
  );
}

function ProgramMove() {
  return (
    <div className="program-move">
      <i className="fa fa-arrows" />
    </div>
  );
}

function ProgramLock() {
  return (
    <div className="program-lock">
      <i className="fa fa-lock" />
    </div>
  );
}

function ProgramUrl({ url }) {
  return (
    <div className="program-url">
      <a href={url} rel="noopener noreferrer" target="_blank">
        <i className="fa fa-link" />
      </a>
    </div>
  );
}

function ProgramClone({ clone }) {
  return (
    <div className="program-clone" onClick={clone}>
      <i className="fa fa-clone" />
    </div>
  );
}

function isHidden(programTitle) {
  return programTitle.length > 0 && programTitle[0] === "(";
}
