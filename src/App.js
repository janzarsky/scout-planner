import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <Timetable />
    </div>
  );
}

class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: [],
    }
    this.startDrag = this.startDrag.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  componentDidMount() {
    // TODO get this from backend
    this.setState({
      programs: [
        {
          id: 'test1',
          begin: Date.parse('2020-06-12T12:00:00.000+00:00'),
          duration: 2*60*60*1000,
          title: 'Test 1'
        },
        {
          id: 'test2',
          begin: Date.parse('2020-06-14T09:15:00.000+00:00'),
          duration: 2*60*60*1000,
          title: 'Test 2'
        },
        {
          id: 'test3',
          begin: Date.parse('2020-08-18T17:35:00.000+00:00'),
          duration: 2*60*60*1000,
          title: 'Test 3'
        },
        {
          id: 'invalid1',
          begin: Date.parse('2020-03-18T17:00:00.000+00:00'),
          duration: 2*60*60*1000,
          title: 'Invalid date'
        },
      ],
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
    });
  }

  render() {
    const programs = this.state.programs;
    if (programs.length === 0)
      return null;

    const hour = Date.UTC(1970, 0, 1, 1);
    const width = Math.ceil((this.state.dayEnd - this.state.dayStart)/hour);
    const timeHeaders = Array.from(
      {length: width},
      (x,i) => new Date(this.state.dayStart + i*hour)
    );
    const timeSpan = Math.ceil(hour/this.state.timeStep);
    const times = Array.from(
      {length: width*timeSpan},
      (x,i) => new Date(this.state.dayStart + i)
    );
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
        {times.map((time, idxTime) =>
          days.map((date, idxDate) =>
            <Droppable
              key={[idxTime, idxDate]}
              x={idxTime + 2}
              y={idxDate + 2}
              onDrop={this.onDrop}
            />
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
        {programs.map((program) =>
          <Program
            key={program.id}
            program={program}
            rect={this.getRect(program)}
            startDrag={this.startDrag}
          />
        )}
      </div>
    );
  }

  startDrag(id) {
    this.draggedProgram = id;
  }

  onDrop(x, y) {
    var programs = this.state.programs.slice();
    const idx = programs.findIndex((p) => p.id === this.draggedProgram);
    var newProg = programs[idx];
    newProg.begin += 60*60*1000;
    programs[idx] = newProg;
    this.setState({ programs: programs });
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
        className={(this.state.dragOver) ? 'drag-over' : ''}
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
        }}
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
    this.props.onDrop(this.props.x, this.props.y);
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
      {props.date.getUTCDate()}.{props.date.getUTCMonth()}.
    </div>
  );
}

class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = { dragged: false };
  }

  render() {
    const program = this.props.program;

    if (this.props.rect.x < 0 || this.props.rect.y < 0)
      return null;

    return (
      <div
        className={'timetable-program-wrapper'
                   + (this.state.dragged ? ' dragged' : '')}
        style={{
          gridColumnStart: this.props.rect.x + 2,
          gridRowStart: this.props.rect.y + 2,
          gridColumnEnd: 'span ' + this.props.rect.width,
          gridRowEnd: 'span ' + this.props.rect.height,
          transform: `translate(${this.state.translateX}px,`
                     + `${this.state.translateY}px)`,
        }}
        draggable
        onDragStart={(e) => this.onDragStart(e)}
        onDragEnd={(e) => this.onDragEnd(e)}
      >
        <div className="timetable-program">
          {program.title}
        </div>
      </div>
    );
  }

  onDragStart(e) {
    this.props.startDrag(this.props.program.id);
    this.setState({ dragged: true });
  }

  onDragEnd(e) {
    e.preventDefault();
    this.setState({ dragged: false });
  }
}

export default App;
