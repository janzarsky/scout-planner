import React from "react";
import { formatTime } from "../helpers/DateUtils";
import { level } from "../helpers/Level";

export default class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragged: false };
  }

  render() {
    return (
      <div
        className={"program-wrapper" + (this.state.dragged ? " dragged" : "")}
        style={{
          gridColumnStart: this.props.rect.x + 3,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: "span " + this.props.rect.width,
          gridRowEnd: "span " + this.props.rect.height,
        }}
        draggable={!this.props.program.locked}
        onDragStart={(e) => this.onDragStart(e)}
        onDragEnd={(e) => this.onDragEnd(e)}
      >
        <ProgramBody
          program={this.props.program}
          violations={this.props.violations}
          pkgs={this.props.pkgs}
          filtered={this.props.filtered}
          viewSettings={this.props.viewSettings}
          activeRange={this.props.activeRange}
        />
        <ProgramEdit
          program={this.props.program}
          onEdit={this.props.onEdit}
          userLevel={this.props.userLevel}
        />
        {this.props.program.locked && <ProgramLock />}
        {!this.props.program.locked && this.props.userLevel >= level.EDIT && (
          <ProgramMove />
        )}
        {this.props.program.url && <ProgramUrl url={this.props.program.url} />}
        {this.props.userLevel >= level.EDIT && (
          <ProgramClone clone={() => this.props.clone(this.props.program)} />
        )}
      </div>
    );
  }

  onDragStart(e) {
    this.props.onDragStart(this.props.program._id);
    setTimeout(() => this.setState({ dragged: true }));
  }

  onDragEnd(e) {
    e.preventDefault();
    this.setState({ dragged: false });
  }
}

function ProgramBody(props) {
  const pkg = props.pkgs.find((p) => p._id === props.program.pkg);
  const pkgName = pkg ? pkg.name : "";
  const color = pkg ? pkg.color : null;
  let rangeValue =
    props.activeRange && props.program.ranges
      ? props.program.ranges[props.activeRange]
      : 0;
  if (rangeValue === undefined) rangeValue = 0;

  return (
    <div
      className={
        "program" +
        (props.violations && props.viewSettings.viewViolations
          ? " violation"
          : "") +
        (props.filtered ? " filtered" : "") +
        (props.activeRange ? " range range-" + rangeValue : "")
      }
      style={
        color && !props.filtered && !props.activeRange
          ? { backgroundColor: color }
          : {}
      }
      title={props.violations && props.violations.join(", ")}
    >
      <ProgramText
        program={props.program}
        pkgName={pkgName}
        viewSettings={props.viewSettings}
        violations={props.violations}
      />
    </div>
  );
}

function ProgramText(props) {
  return (
    <div className="program-text">
      {props.program.title[0] !== "(" && <h3>{props.program.title}</h3>}
      {props.viewSettings.viewPkg && props.pkgName[0] !== "(" && (
        <p className="program-package">{props.pkgName}</p>
      )}
      {props.viewSettings.viewTime && (
        <p className="program-time">
          {formatTime(props.program.begin)}&ndash;
          {formatTime(props.program.begin + props.program.duration)}
        </p>
      )}
      {props.viewSettings.viewPeople && (
        <p className="program-people">
          {[...props.program.people]
            .sort((a, b) => a.localeCompare(b))
            .map((person) => (
              <span
                key={person}
                className={
                  // dirty hack
                  props.viewSettings.viewViolations &&
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
      )}
      {props.viewSettings.viewViolations && props.violations && (
        <p className="program-violations">
          {props.violations
            // dirty hack
            .filter((violation) => !violation.includes("Jeden člověk na více"))
            .join(", ")}
        </p>
      )}
    </div>
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
