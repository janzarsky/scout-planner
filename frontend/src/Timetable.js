/**
 * @file Timetable component
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

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
    const settings = this.getSettings(this.props.programs, this.props.groups);

    return (
      <div
        className="timetable"
        style={{
          gridTemplateRows: "repeat(" + (settings.days.length*settings.groupCnt + 1) + ", auto)",
          gridTemplateColumns: "auto auto repeat(" + settings.timeSpan*settings.timeHeaders.length
                               + ", minmax(20px, 1fr))",
        }}
      >
        {[...this.getDroppables(settings)]}
        {[...this.getTimeHeaders(settings)]}
        {[...this.getDateHeaders(settings)]}
        {[...this.getPrograms(this.props.programs, settings, this.props.viewSettings)]}
      </div>
    );
  }

  getSettings(programs, groups) {
    const hour = DateUtils.parseDuration('1:00');

    if (programs.size === 0)
      programs = new Map([[1, { begin: Date.now(), duration: hour }]]);

    var settings = {};

    settings.days = [];
    for (const prog of programs.values()) {
      settings.days.push(DateUtils.getOnlyDate(prog.begin));
    }
    settings.days = [...new Set(settings.days)].sort();

    settings.dayStart = DateUtils.parseTime('10:00');
    for (const prog of programs.values()) {
      const time = DateUtils.getOnlyTime(prog.begin)
      if (time < settings.dayStart)
        settings.dayStart = time;
    }

    settings.dayEnd = DateUtils.parseTime('16:00');
    for (const prog of programs.values()) {
      let time = DateUtils.getOnlyTime(prog.begin + prog.duration)
      if (time === 0)
        time = DateUtils.parseTime('23:59');
      if (time > settings.dayEnd)
        settings.dayEnd = time;
    }

    settings.timeHeaders = Array.from(
      {length: Math.ceil((settings.dayEnd - settings.dayStart)/hour)},
      (_, idx) => settings.dayStart + idx*hour
    );
    settings.timeStep = 15*60*1000;
    settings.timeSpan = Math.ceil(hour/(15*60*1000));
    settings.groups = [...groups.keys()];
    settings.groupCnt = groups.size;

    return settings;
  }

  *getDroppables(settings) {
    for (const [idxDate, date] of settings.days.entries()) {
      for (const [idxTime, time] of settings.timeHeaders.entries()) {
        for (let idxSpan = 0; idxSpan < settings.timeSpan; idxSpan++) {
          yield <Droppable
            key={[idxTime, idxDate, idxSpan]}
            x={3 + idxTime*settings.timeSpan + idxSpan}
            y={2 + idxDate*settings.groupCnt}
            height={settings.groupCnt}
            begin={date + time + idxSpan*settings.timeStep}
            onDrop={this.onDroppableDrop}
            addProgramModal={this.props.addProgramModal}
          />;
        }
      }
    }
  }

  *getTimeHeaders(settings) {
    for (const [idx, time] of settings.timeHeaders.entries()) {
      yield <TimeHeader
        key={time}
        time={new Date(time)}
        pos={idx*settings.timeSpan + 3}
        span={settings.timeSpan}
      />;
    }
  }

  *getDateHeaders(settings) {
    for (const [idx, date] of settings.days.entries()) {
      yield <>
        <DateHeader
          key={date}
          date={new Date(date)}
          pos={idx*settings.groupCnt + 2}
          span={settings.groupCnt}
        />
        {settings.groups.map((group, groupIdx) =>
          <div
            className="groupheader"
            style={{
              gridRowStart: idx*settings.groupCnt + groupIdx + 2,
            }}
          >
            {this.props.groups.get(group).name}
          </div>
        )}
      </>;
    }
  }

  *getPrograms(programs, settings, viewSettings) {
    for (const [key, prog] of programs) {
      yield <Program
        key={key}
        program={prog}
        filtered={(this.props.filterPkgs.indexOf(prog.pkg) !== -1)}
        violations={this.props.violations.get(key)}
        rect={this.getRect(prog, settings)}
        onDragStart={this.onProgramDragStart}
        pkgs={this.props.pkgs}
        editProgramModal={this.props.editProgramModal}
        viewSettings={viewSettings}
      />;
    }
  }

  getRect(program, settings) {
    const date = DateUtils.getOnlyDate(program.begin);
    const time = DateUtils.getOnlyTime(program.begin);

    var [first, last] = [0, settings.groupCnt - 1];

    if (program.groups && program.groups.length > 0) {
      const groupMap = settings.groups.map(group => (program.groups.indexOf(group) !== -1))
      first = groupMap.reduce((acc, cur, idx) => (cur && idx < acc) ? idx : acc,
        settings.groupCnt - 1);
      last = groupMap.reduce((acc, cur, idx) => (cur && idx > acc) ? idx : acc, 0);
    }

    return {
      x: Math.ceil((time - settings.dayStart)/settings.timeStep),
      y: settings.days.indexOf(date)*settings.groupCnt + first,
      width: Math.ceil(program.duration/settings.timeStep),
      height: last - first + 1,
    };
  }

  onProgramDragStart(id) {
    this.draggedProgram = id;
  }

  onDroppableDrop(begin) {
    var prog = this.props.programs.get(this.draggedProgram);
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
        className={'droppable ' + ((this.state.dragOver) ? 'drag-over' : '')}
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
          gridRowEnd: 'span ' + this.props.height,
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
      className="timeheader"
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
      className="dateheader"
      style={{
        gridRowStart: props.pos,
        gridRowEnd: 'span ' + props.span,
      }}
    >
      {DateUtils.formatDay(props.date.getTime())}<br/>{props.date.getUTCDate()}.<br/>{props.date.getUTCMonth() + 1}.
    </div>;
}

export default Timetable;
