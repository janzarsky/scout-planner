import { useDrag } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import Client from "../Client";
import { formatTime } from "../helpers/DateUtils";
import { level } from "../helpers/Level";
import { addProgram } from "../store/programsSlice";

export default function Program(props) {
  const { packages } = useSelector((state) => state.packages);

  const { token, table } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  const [, drag] = useDrag(() => ({
    type: "program",
    item: { id: props.program._id },
  }));

  const dispatch = useDispatch();
  const clone = (p) =>
    client
      .addProgram(p)
      .then((resp) => dispatch(addProgram(resp)), props.handleError);

  return (
    <div
      ref={drag}
      className={"program-wrapper"}
      style={{
        gridColumnStart: props.rect.x + 3,
        gridRowStart: props.rect.y + 2,
        gridColumnEnd: "span " + props.rect.width,
        gridRowEnd: "span " + props.rect.height,
      }}
      draggable={!props.program.locked}
    >
      <ProgramBody
        program={props.program}
        violations={props.violations}
        pkg={packages.find((p) => p._id === props.program.pkg)}
      />
      <ProgramEdit
        program={props.program}
        onEdit={props.onEdit}
        userLevel={props.userLevel}
      />
      {props.program.locked && <ProgramLock />}
      {!props.program.locked && props.userLevel >= level.EDIT && (
        <ProgramMove />
      )}
      {props.program.url && <ProgramUrl url={props.program.url} />}
      {props.userLevel >= level.EDIT && (
        <ProgramClone clone={() => clone(props.program)} />
      )}
    </div>
  );
}

function ProgramBody(props) {
  const highlighted = useSelector(
    (state) =>
      state.view.highlightingEnabled &&
      state.view.highlightedPackages.indexOf(props.program.pkg) !== -1
  );
  const viewViolations = useSelector((state) => state.view.viewViolations);
  const { rangesEnabled, activeRange } = useSelector((state) => state.view);
  let rangeValue =
    activeRange && props.program.ranges ? props.program.ranges[activeRange] : 0;
  if (rangeValue === undefined) rangeValue = 0;

  return (
    <div
      className={
        "program" +
        (props.violations && viewViolations ? " violation" : "") +
        (highlighted ? " highlighted" : "") +
        (rangesEnabled ? " range range-" + rangeValue : "")
      }
      style={
        !highlighted && !rangesEnabled && props.pkg
          ? { backgroundColor: props.pkg.color }
          : {}
      }
      title={props.violations && props.violations.join(", ")}
    >
      <ProgramText
        people={props.program.people}
        title={props.program.title}
        begin={props.program.begin}
        duration={props.program.duration}
        pkgName={props.pkg ? props.pkg.name : ""}
        violations={props.violations}
      />
    </div>
  );
}

function ProgramText(props) {
  const { viewPkg, viewTime, viewPeople, viewViolations } = useSelector(
    (state) => state.view
  );
  return (
    <div className="program-text">
      {!isHidden(props.title) && <h3>{props.title}</h3>}
      {viewPkg && !isHidden(props.pkgName) && (
        <p className="program-package">{props.pkgName}</p>
      )}
      {viewTime && (
        <ProgramTime begin={props.begin} end={props.begin + props.duration} />
      )}
      {viewPeople && (
        <ProgramPeople people={props.people} violations={props.violations} />
      )}
      {viewViolations && props.violations && (
        <ProgramViolations violations={props.violations} />
      )}
    </div>
  );
}

function ProgramTime(props) {
  return (
    <p className="program-time">
      {formatTime(props.begin)}&ndash;
      {formatTime(props.end)}
    </p>
  );
}

function ProgramPeople(props) {
  const viewViolations = useSelector((state) => state.view.viewViolations);

  return (
    <p className="program-people">
      {[...props.people]
        .sort((a, b) => a.localeCompare(b))
        .map((person) => (
          <span
            key={person}
            className={
              // dirty hack
              viewViolations &&
              props.violations &&
              props.violations.join().includes(person)
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
    </p>
  );
}

function ProgramViolations(props) {
  return (
    <p className="program-violations">
      {props.violations
        // dirty hack
        .filter((violation) => !violation.includes("Jeden člověk na více"))
        .join(", ")}
    </p>
  );
}

function ProgramEdit(props) {
  return (
    <div className="program-edit" onClick={() => props.onEdit(props.program)}>
      {props.userLevel >= level.EDIT ? (
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

function ProgramUrl(props) {
  return (
    <div className="program-url">
      <a href={props.url} rel="noopener noreferrer" target="_blank">
        <i className="fa fa-link" />
      </a>
    </div>
  );
}

function ProgramClone(props) {
  return (
    <div className="program-clone" onClick={props.clone}>
      <i className="fa fa-clone" />
    </div>
  );
}

function isHidden(programTitle) {
  return programTitle.length > 0 && programTitle[0] === "(";
}
