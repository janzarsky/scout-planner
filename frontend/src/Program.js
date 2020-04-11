import React from 'react';
import DateUtils from './DateUtils';

class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragged: false };
  }

  render() {
    if (this.props.rect.x < 0 || this.props.rect.y < 0)
      return null;

    return <div
        className={'timetable-program-wrapper' + (this.state.dragged ? ' dragged' : '')}
        style={{
          gridColumnStart: this.props.rect.x + 2,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: 'span ' + this.props.rect.width,
          gridRowEnd: 'span ' + this.props.rect.height,
        }}
        draggable
        onDragStart={e => this.onDragStart(e)}
        onDragEnd={e => this.onDragEnd(e)}
      >
        <ProgramBody
          program={this.props.program}
          violations={this.props.violations}
          pkgs={this.props.pkgs}
          filtered={this.props.filtered}
        />
        <ProgramEdit
          program={this.props.program}
          editProgramModal={this.props.editProgramModal}
        />
        <ProgramMove/>
      </div>;
  }

  onDragStart(e) {
    this.props.onDragStart(this.props.program._id);
    this.setState({ dragged: true });
  }

  onDragEnd(e) {
    e.preventDefault();
    this.setState({ dragged: false });
  }
}

function ProgramBody(props) {
  const pkgName = (props.pkgs.get(props.program.pkg)) ? props.pkgs.get(props.program.pkg).name : '';
  const color = (props.pkgs.get(props.program.pkg)) ? props.pkgs.get(props.program.pkg).color : null;

  return <div
    className={'timetable-program' + (props.violations ? ' violation' : '') + (props.filtered ? ' filtered' : '')}
    style={(color && !props.filtered) ? {backgroundColor: color} : {}}
    title={props.violations && props.violations.join(', ')}
  >
    <ProgramText program={props.program} pkgName={pkgName}/>
  </div>;
}

function ProgramText(props) {
  return <div className="program-text">
    <h3>{props.program.title}</h3>
    <p className="program-package">{props.pkgName}</p>
    <p className="program-time">
      {DateUtils.formatTime(props.program.begin)}&ndash;
      {DateUtils.formatTime(props.program.begin + props.program.duration)}
    </p>
  </div>;
}

function ProgramEdit(props) {
  return <div
    className="program-modal-right"
    onClick={_ => props.editProgramModal(props.program)}>
    <i className="fa fa-pencil"/>
  </div>;
}

function ProgramMove() {
  return <div className="program-modal-left">
    <i className="fa fa-arrows"/>
  </div>;
}

export default Program;
