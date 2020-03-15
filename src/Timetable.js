import React from 'react';
import Program from './Program';

class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programModal: false,
      people: {
        'walker': 'Walker',
        'gabca': 'Gabča',
        'verca': 'Verča',
        'woody': 'Woody',
      },
      pkgs: {
        'or': 'Oddílové rady',
        'hosp': 'Hospodaření',
        'psy': 'Psychologie',
      },
      days: [
        Date.UTC(2020, 5, 12),
        Date.UTC(2020, 5, 13),
        Date.UTC(2020, 5, 14),
        Date.UTC(2020, 7, 18),
        Date.UTC(2020, 7, 19),
        Date.UTC(2020, 7, 20),
        Date.UTC(2020, 7, 21),
        Date.UTC(2020, 7, 22),
        Date.UTC(2020, 7, 23),
      ],
      dayStart: Date.UTC(1970, 0, 1, 7, 0),
      dayEnd: Date.UTC(1970, 0, 1, 23, 59),
      timeStep: 15*60*1000,
    };
    this.onProgramDragStart = this.onProgramDragStart.bind(this);
    this.onDroppableDrop = this.onDroppableDrop.bind(this);
  }

  render() {
    const programs = this.props.programs;

    const hour = Date.UTC(1970, 0, 1, 1);
    const width = Math.ceil((this.state.dayEnd - this.state.dayStart)/hour);
    const timeHeaders = Array.from(
      {length: width},
      (x,i) => new Date(this.state.dayStart + i*hour)
    );
    const timeSpan = Math.ceil(hour/this.state.timeStep);
    const days = this.state.days.map((day) => new Date(day));

    return (
      <div
        className="timetable"
        style={{
          gridTemplateRows: "repeat(" + (this.state.days.length + 1) + ", auto)",
          gridTemplateColumns: "auto repeat(" + timeSpan*width
                               + ", minmax(20px, 1fr))",
        }}
      >
        {days.map((date, idxDate) =>
          timeHeaders.map((time, idxTime) =>
            Array.from({length: timeSpan}, (x, i) => i*this.state.timeStep).map((span, idxSpan) =>
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
            rect={this.getRect(programs[key])}
            onDragStart={this.onProgramDragStart}
            people={this.state.people}
            pkgs={this.state.pkgs}
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
    prog.begin = begin;
    this.props.updateProgram(prog);
  }

  getRect(program) {
    const begin = new Date(program.begin);

    const date = Date.UTC(begin.getUTCFullYear(), begin.getUTCMonth(),
                          begin.getUTCDate());
    const y = this.state.days.indexOf(date);

    const time = Date.UTC(1970, 0, 1, begin.getUTCHours(),
                          begin.getUTCMinutes());
    const x = Math.ceil((time - this.state.dayStart)/this.state.timeStep);

    const width = Math.ceil(program.duration/this.state.timeStep);

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
