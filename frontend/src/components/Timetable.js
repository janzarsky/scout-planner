import React from "react";
import {
  formatDay,
  getOnlyDate,
  getOnlyTime,
  parseDuration,
  parseTime,
} from "../helpers/DateUtils";
import Program from "./Program";
import TimeIndicator from "./TimeIndicator";

export default class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programModal: false,
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
          gridTemplateRows:
            "repeat(" +
            (settings.days.length * settings.groupCnt + 1) +
            ", auto)",
          gridTemplateColumns:
            "auto auto repeat(" +
            settings.timeSpan * settings.timeHeaders.length +
            ", minmax(20px, 1fr))",
        }}
      >
        {[...this.getDroppables(settings)]}
        {[...this.getTimeHeaders(settings)]}
        {[...this.getDateHeaders(settings)]}
        {[...this.getGroupHeaders(settings)]}
        {[
          ...this.getPrograms(
            this.props.programs,
            settings,
            this.props.viewSettings
          ),
        ]}
        {this.getTimeIndicator(settings)}
      </div>
    );
  }

  getSettings(programs, groups) {
    const hour = parseDuration("1:00");

    if (programs.length === 0)
      programs = [{ begin: Date.now(), duration: hour }];

    var settings = {};

    settings.days = [];
    for (const prog of programs) {
      settings.days.push(getOnlyDate(prog.begin));
    }
    settings.days = [...new Set(settings.days)].sort();

    settings.dayStart = parseTime("10:00");
    for (const prog of programs) {
      const time = getOnlyTime(prog.begin);
      if (time < settings.dayStart) settings.dayStart = time;
    }

    settings.dayEnd = parseTime("16:00");
    for (const prog of programs) {
      let time = getOnlyTime(prog.begin + prog.duration);
      if (time === 0) time = parseTime("23:59");
      if (time > settings.dayEnd) settings.dayEnd = time;
    }

    settings.timeHeaders = Array.from(
      { length: Math.ceil((settings.dayEnd - settings.dayStart) / hour) },
      (_, idx) => settings.dayStart + idx * hour
    );
    settings.timeStep = 15 * 60 * 1000;
    settings.timeSpan = Math.ceil(hour / (15 * 60 * 1000));
    settings.groups = [...groups].sort((a, b) => {
      if (a.order < b.order) return -1;
      if (a.order > b.order) return 1;
      return 0;
    });
    settings.groupCnt = groups.length;

    return settings;
  }

  *getDroppables(settings) {
    for (const [idxDate, date] of settings.days.entries()) {
      for (const [idxTime, time] of settings.timeHeaders.entries()) {
        for (let idxSpan = 0; idxSpan < settings.timeSpan; idxSpan++) {
          yield (
            <Droppable
              key={[idxTime, idxDate, idxSpan]}
              x={3 + idxTime * settings.timeSpan + idxSpan}
              y={2 + idxDate * settings.groupCnt}
              height={settings.groupCnt}
              begin={date + time + idxSpan * settings.timeStep}
              onDrop={this.onDroppableDrop}
              addProgramModal={this.props.addProgramModal}
            />
          );
        }
      }
    }
  }

  *getTimeHeaders(settings) {
    for (const [idx, time] of settings.timeHeaders.entries()) {
      yield (
        <TimeHeader
          key={time}
          time={new Date(time)}
          pos={idx * settings.timeSpan + 3}
          span={settings.timeSpan}
        />
      );
    }
  }

  *getDateHeaders(settings) {
    for (const [idx, date] of settings.days.entries()) {
      yield (
        <DateHeader
          key={date}
          date={new Date(date)}
          pos={idx * settings.groupCnt + 2}
          span={settings.groupCnt}
        />
      );
    }
  }

  *getGroupHeaders(settings) {
    for (const [idx, date] of settings.days.entries()) {
      for (const [groupIdx, group] of settings.groups.entries()) {
        yield (
          <GroupHeader
            key={`group,${date},${group._id}`}
            pos={idx * settings.groupCnt + groupIdx + 2}
            name={group.name}
          />
        );
      }
    }
  }

  *getPrograms(programs, settings, viewSettings) {
    for (const prog of programs) {
      yield (
        <Program
          key={prog._id}
          program={prog}
          filtered={this.props.filterPkgs.indexOf(prog.pkg) !== -1}
          violations={this.props.violations.get(prog._id)}
          rect={this.getRect(prog, settings)}
          onDragStart={this.onProgramDragStart}
          pkgs={this.props.pkgs}
          editProgramModal={this.props.editProgramModal}
          viewSettings={viewSettings}
          clone={this.props.clone}
          activeRange={this.props.activeRange}
        />
      );
    }
  }

  getRect(program, settings) {
    const date = getOnlyDate(program.begin);
    const time = getOnlyTime(program.begin);

    var [first, last] = [0, settings.groupCnt - 1];

    if (program.groups && program.groups.length > 0) {
      const groupMap = settings.groups.map(
        (group) => program.groups.findIndex((idx) => idx === group._id) !== -1
      );
      first = groupMap.reduce(
        (acc, cur, idx) => (cur && idx < acc ? idx : acc),
        settings.groupCnt - 1
      );
      last = groupMap.reduce(
        (acc, cur, idx) => (cur && idx > acc ? idx : acc),
        0
      );
    }

    return {
      x: Math.ceil((time - settings.dayStart) / settings.timeStep),
      y: settings.days.indexOf(date) * settings.groupCnt + first,
      width: Math.ceil(program.duration / settings.timeStep),
      height: last - first + 1,
    };
  }

  getTimeIndicator(settings) {
    const now = Date.now();
    // the times in timetable are in UTC (we don't know the timezone of the actual event)
    // the indicator assumes that you are in the correct timezone
    const zoneAdjust = now - new Date(now).getTimezoneOffset() * 60 * 1000;

    const currTime = getOnlyTime(zoneAdjust);
    if (currTime < settings.dayStart || currTime > settings.dayEnd)
      return <div />;

    const currDate = getOnlyDate(zoneAdjust);
    if (settings.days.indexOf(currDate) === -1) return <div />;

    return (
      <TimeIndicator
        rect={{
          x: Math.ceil((currTime - settings.dayStart) / settings.timeStep),
          y: settings.days.indexOf(currDate) * settings.groupCnt,
          width: 1,
          height: settings.groupCnt,
        }}
      />
    );
  }

  onProgramDragStart(id) {
    this.draggedProgram = id;
  }

  onDroppableDrop(begin) {
    var prog = this.props.programs.find(
      (program) => program._id === this.draggedProgram
    );
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
    return (
      <div
        className={"droppable " + (this.state.dragOver ? "drag-over" : "")}
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
          gridRowEnd: "span " + this.props.height,
        }}
        onClick={(_) => this.props.addProgramModal({ begin: this.props.begin })}
        onDrop={(e) => this.onDrop(e)}
        onDragEnter={(e) => this.onDragEnter(e)}
        onDragOver={(e) => this.onDragOver(e)}
        onDragLeave={(e) => this.onDragLeave(e)}
      />
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
      className="timeheader"
      style={{
        gridColumnStart: props.pos,
        gridColumnEnd: "span " + props.span,
      }}
    >
      {props.time.getUTCHours()}
    </div>
  );
}

function DateHeader(props) {
  return (
    <div
      className="dateheader"
      style={{
        gridRowStart: props.pos,
        gridRowEnd: "span " + props.span,
      }}
    >
      {formatDay(props.date.getTime())}
      <br />
      {props.date.getUTCDate()}.<br />
      {props.date.getUTCMonth() + 1}.
    </div>
  );
}

function GroupHeader(props) {
  return (
    <div
      className="groupheader"
      style={{
        gridRowStart: props.pos,
      }}
    >
      {props.name}
    </div>
  );
}
