import React from 'react';
import DateUtils from './DateUtils.js';

class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragged: false,
    };
  }

  render() {
    if (this.props.rect.x < 0 || this.props.rect.y < 0)
      return null;

    const program = this.props.program;
    const pkgName = (this.props.pkgs[program.pkg]) ? this.props.pkgs[program.pkg].name : '';
    const color = (this.props.pkgs[program.pkg]) ? this.props.pkgs[program.pkg].color : null;

    return (
      <div
        className={'timetable-program-wrapper'
                   + (this.state.dragged ? ' dragged' : '')}
        style={{
          gridColumnStart: this.props.rect.x + 2,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: 'span ' + this.props.rect.width,
          gridRowEnd: 'span ' + this.props.rect.height,
        }}
        draggable
        onDragStart={(e) => this.onDragStart(e)}
        onDragEnd={(e) => this.onDragEnd(e)}
      >
        <div
          className="timetable-program"
          style={(color) ? {backgroundColor: color} : {}}
        >
          <div className="program-text">
            <h3>{program.title}</h3>
            <p className="program-package">{pkgName}</p>
            <p className="program-time">
              {DateUtils.formatTime(program.begin)}&ndash;
              {DateUtils.formatTime(program.begin + program.duration)}
            </p>
          </div>
        </div>
        <div
          className="program-modal-right"
          onClick={(_) => this.props.editProgramModal(program)}
        >
          <i className="fa fa-pencil"></i>
        </div>
        <div className="program-modal-left">
          <i className="fa fa-arrows"></i>
        </div>
      </div>
    );
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

export default Program;
