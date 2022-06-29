import React from "react";
import { formatTime } from "../helpers/DateUtils";

export default class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragged: false };
  }

  render() {
    if (this.props.rect.x < 0 || this.props.rect.y < 0) return null;

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
        />
        <ProgramEdit
          program={this.props.program}
          editProgramModal={this.props.editProgramModal}
        />
        {this.props.program.locked ? <ProgramLock /> : <ProgramMove />}
        {this.props.program.url ? (
          <ProgramUrl url={this.props.program.url} />
        ) : null}
        <ProgramClone clone={() => this.props.clone(this.props.program)} />
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

  return (
    <div
      className={
        "program" +
        (props.violations ? " violation" : "") +
        (props.filtered ? " filtered" : "")
      }
      style={color && !props.filtered ? { backgroundColor: color } : {}}
      title={props.violations && props.violations.join(", ")}
    >
      <ProgramText
        program={props.program}
        pkgName={pkgName}
        viewSettings={props.viewSettings}
      />
    </div>
  );
}

function ProgramText(props) {
  return (
    <div className="program-text">
      <h3>{props.program.title}</h3>
      {props.viewSettings.viewPkg && (
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
            .join(", ")}
        </p>
      )}
    </div>
  );
}

function ProgramEdit(props) {
  return (
    <div
      className="program-edit"
      onClick={(_) => props.editProgramModal(props.program)}
    >
      <i className="fa fa-pencil" />
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
