import { useDrag } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import Client from "../Client";
import { formatTime } from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import { addError } from "../store/errorsSlice";
import { addProgram } from "../store/programsSlice";

export default function Program({ program, violations, rect, onEdit }) {
  const { packages } = useSelector((state) => state.packages);

  const { token, table, userLevel } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  const [, drag] = useDrag(() => ({
    type: "program",
    item: { id: program._id },
  }));

  const dispatch = useDispatch();
  const clone = (p) =>
    client.addProgram(p).then(
      (resp) => dispatch(addProgram(resp)),
      (e) => dispatch(addError(e.message))
    );

  return (
    <div
      ref={drag}
      className={"program-wrapper"}
      draggable={!program.locked}
      style={{
        gridColumnStart: rect.x,
        gridRowStart: rect.y,
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
  const highlighted = useSelector(
    (state) =>
      state.view.highlightingEnabled &&
      state.view.highlightedPackages.indexOf(program.pkg) !== -1
  );
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
        (rangesEnabled ? " range range-" + rangeValue : "") +
        (program.duration <= 2 * timeStep ? " narrow" : "")
      }
      style={
        !highlighted && !rangesEnabled && pkg
          ? { backgroundColor: pkg.color }
          : {}
      }
      title={violations && violations.join(", ")}
    >
      <ProgramText
        people={program.people}
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
  people,
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
      {viewPeople && people.length > 0 && (
        <ProgramPeople people={people} violations={violations} />
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

function ProgramPeople({ people, violations }) {
  const viewViolations = useSelector((state) => state.view.viewViolations);

  return (
    <div className="program-people">
      <i className="fa fa-user-o" />
      &nbsp;
      {[...people]
        .sort((a, b) => a.localeCompare(b))
        .map((person) => (
          <span
            key={person}
            className={
              // dirty hack
              viewViolations && violations && violations.join().includes(person)
                ? "program-violated"
                : ""
            }
          >
            {person}
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
        // dirty hack
        .filter((violation) => !violation.includes("Jeden člověk na více"))
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
