import React from 'react';
import Program from './Program';

class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { programModal: false };
    this.onProgramDragStart = this.onProgramDragStart.bind(this);
    this.onDroppableDrop = this.onDroppableDrop.bind(this);
  }

  render() {
    const programs = this.props.programs;

    if (!this.props.settings.days)
      return null;

    const hour = Date.UTC(1970, 0, 1, 1);
    const width = Math.ceil((this.props.settings.dayEnd - this.props.settings.dayStart)/hour);
    const timeHeaders = Array.from(
      {length: width},
      (x,i) => new Date(this.props.settings.dayStart + i*hour)
    );
    const timeSpan = Math.ceil(hour/this.props.settings.timeStep);
    const days = this.props.settings.days.map((day) => new Date(day));

    return (
      <div
        className="timetable"
        style={{
          gridTemplateRows: "repeat(" + (this.props.settings.days.length + 1) + ", auto)",
          gridTemplateColumns: "auto repeat(" + timeSpan*width
                               + ", minmax(20px, 1fr))",
        }}
      >
        {days.map((date, idxDate) =>
          timeHeaders.map((time, idxTime) =>
            Array.from({length: timeSpan}, (x, i) => i*this.props.settings.timeStep).map((span, idxSpan) =>
              <Droppable
                key={[idxTime, idxDate, idxSpan]}
                x={2 + idxTime*timeSpan + idxSpan}
                y={2 + idxDate}
                begin={date.getTime() + time.getTime() + span}
                onDrop={this.onDroppableDrop}
                addProgramModal={this.props.addProgramModal}
              />
            )
          )
        )}
        {timeHeaders.map((time, idx) =>
          <TimeHeader
            key={time.toString()}
            time={time}
            pos={idx*timeSpan + 2}
            span={timeSpan}
          />
        )}
        {days.map((date, idx) =>
          <DateHeader
            key={date.toString()}
            date={date}
            pos={idx + 2}
          />
        )}
        {Object.keys(programs).map((key) =>
          <Program
            key={key}
            program={programs[key]}
            violations={this.props.violations[key]}
            rect={this.getRect(programs[key])}
            onDragStart={this.onProgramDragStart}
            pkgs={this.props.pkgs}
            editProgramModal={this.props.editProgramModal}
          />
        )}
      </div>
    );
  }

  onProgramDragStart(id) {
    this.draggedProgram = id;
  }

  onDroppableDrop(begin) {
    var prog = this.props.programs[this.draggedProgram];
    if (prog) {
      prog.begin = begin;
      this.props.updateProgram(prog);
    }
  }

  getRect(program) {
    const begin = new Date(program.begin);

    const date = Date.UTC(begin.getUTCFullYear(), begin.getUTCMonth(),
                          begin.getUTCDate());
    const y = this.props.settings.days.indexOf(date);

    const time = Date.UTC(1970, 0, 1, begin.getUTCHours(),
                          begin.getUTCMinutes());
    const x = Math.ceil((time - this.props.settings.dayStart)/this.props.settings.timeStep);

    const width = Math.ceil(program.duration/this.props.settings.timeStep);

    return {x: x, y: y, width: width, height: 1};
  }
}

class Droppable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragOver: false };
  }

  render() {
    return (
      <div
        className={'placeholder ' + ((this.state.dragOver) ? 'drag-over' : '')}
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
        }}
        onClick={(_) => this.props.addProgramModal({begin: this.props.begin})}
        onDrop={(e) => this.onDrop(e)}
        onDragEnter={(e) => this.onDragEnter(e)}
        onDragOver={(e) => this.onDragOver(e)}
        onDragLeave={(e) => this.onDragLeave(e)}
      >
      </div>
    );
  }

  onDragEnter(e) {
    this.setState({ dragOver: true });
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    this.setState({ dragOver: false });
  }

  onDrop(e) {
    e.preventDefault();
    this.props.onDrop(this.props.begin);
    this.setState({ dragOver: false });
  }
}

function TimeHeader(props) {
  return (
    <div
      className="timetable-time"
      style={{
        gridColumnStart: props.pos,
        gridColumnEnd: 'span ' + props.span
      }}
    >
      {props.time.getUTCHours()}
    </div>
  );
}

function DateHeader(props) {
  return (
    <div
      className="timetable-date"
      style={{
        gridRowStart: props.pos
      }}
    >
      {props.date.getUTCDate()}.{props.date.getUTCMonth() + 1}.
    </div>
  );
}

export default Timetable;
