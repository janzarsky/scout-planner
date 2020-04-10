import React from 'react';
import Program from './Program';
import DateUtils from './DateUtils';

class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programModal: false
    };
    this.onProgramDragStart = this.onProgramDragStart.bind(this);
    this.onDroppableDrop = this.onDroppableDrop.bind(this);
  }

  render() {
    const programs = this.props.programs;
    const settings = this.getSettings(programs);

    return (
      <div
        className="timetable"
        style={{
          gridTemplateRows: "repeat(" + (settings.days.length + 1) + ", auto)",
          gridTemplateColumns: "auto repeat(" + settings.timeSpan*settings.timeHeaders.length
                               + ", minmax(20px, 1fr))",
        }}
      >
        {this.getDroppables(settings)}
        {this.getTimeHeaders(settings)}
        {this.getDateHeaders(settings)}
        {this.getPrograms(programs, settings)}
      </div>
    );
  }

  getSettings(programs) {
    const hour = DateUtils.parseDuration('1:00');
    var progs = Object.values(programs);

    if (progs.length === 0)
      progs = [{ begin: Date.now(), duration: hour }]

    const settings = {
      days: Array.from(new Set(
          progs.map(prog => DateUtils.getOnlyDate(prog.begin))
        )).sort(),
      dayStart: progs
        .map(prog => DateUtils.getOnlyTime(prog.begin))
        .reduce((acc, curr) => (acc < curr) ? acc : curr, DateUtils.parseTime('10:00')),
      dayEnd: progs
        .map(prog => {
          const endTime = DateUtils.getOnlyTime(prog.begin + prog.duration);
          return (endTime === 0) ? DateUtils.parseTime('23:59') : endTime;
        })
        .reduce((acc, curr) => (acc > curr) ? acc : curr, DateUtils.parseTime('16:00')),
    };

    return {
      ...settings,
      timeHeaders: Array.from(
        {length: Math.ceil((settings.dayEnd - settings.dayStart)/hour)},
        (_, idx) => settings.dayStart + idx*hour
      ),
      timeStep: 15*60*1000,
      timeSpan: Math.ceil(hour/(15*60*1000)),
    };
  }

  getDroppables(settings) {
    return settings.days.map((date, idxDate) =>
      settings.timeHeaders.map((time, idxTime) =>
        Array.from({length: settings.timeSpan}, (x, i) => i*settings.timeStep)
          .map((span, idxSpan) =>
          <Droppable
            key={[idxTime, idxDate, idxSpan]}
            x={2 + idxTime*settings.timeSpan + idxSpan}
            y={2 + idxDate}
            begin={date + time + span}
            onDrop={this.onDroppableDrop}
            addProgramModal={this.props.addProgramModal}
          />
        )
      )
    );
  }

  getTimeHeaders(settings) {
    return settings.timeHeaders.map((time, idx) =>
      <TimeHeader
        key={time}
        time={new Date(time)}
        pos={idx*settings.timeSpan + 2}
        span={settings.timeSpan}
      />
    );
  }

  getDateHeaders(settings) {
    return settings.days.map((date, idx) =>
      <DateHeader
        key={date}
        date={new Date(date)}
        pos={idx + 2}
      />
    );
  }

  getPrograms(programs, settings) {
    return Object.entries(programs).map(([key, prog]) =>
      <Program
        key={key}
        program={prog}
        violations={this.props.violations[key]}
        rect={this.getRect(prog, settings)}
        onDragStart={this.onProgramDragStart}
        pkgs={this.props.pkgs}
        editProgramModal={this.props.editProgramModal}
      />
    );
  }

  getRect(program, settings) {
    const date = DateUtils.getOnlyDate(program.begin);
    const time = DateUtils.getOnlyTime(program.begin);

    return {
      x: Math.ceil((time - settings.dayStart)/settings.timeStep),
      y: settings.days.indexOf(date),
      width: Math.ceil(program.duration/settings.timeStep),
      height: 1
    };
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
}

class Droppable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragOver: false };
  }

  render() {
    return <div
        className={'placeholder ' + ((this.state.dragOver) ? 'drag-over' : '')}
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
        }}
        onClick={_ => this.props.addProgramModal({begin: this.props.begin})}
        onDrop={e => this.onDrop(e)}
        onDragEnter={e => this.onDragEnter(e)}
        onDragOver={e => this.onDragOver(e)}
        onDragLeave={e => this.onDragLeave(e)}
      />;
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
  return <div
      className="timetable-time"
      style={{
        gridColumnStart: props.pos,
        gridColumnEnd: 'span ' + props.span
      }}
    >
      {props.time.getUTCHours()}
    </div>;
}

function DateHeader(props) {
  return <div
      className="timetable-date"
      style={{
        gridRowStart: props.pos
      }}
    >
      {props.date.getUTCDate()}.{props.date.getUTCMonth() + 1}.
    </div>;
}

export default Timetable;
