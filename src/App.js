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
      width: 16,
      height: 5,
    }
  }

  componentDidMount() {
    // TODO get this from backend
    this.setState({
      programs: [
        { id: 'test1', x: 4, y: 4, title: 'Test 1' },
        { id: 'test2', x: 2, y: 3, title: 'Test 2' },
        { id: 'test3', x: 3, y: 3, title: 'Test 3' },
      ],
      days: [
        new Date('2020-06-12').getTime(),
        new Date('2020-06-13').getTime(),
        new Date('2020-06-14').getTime(),
        new Date('2020-08-18').getTime(),
        new Date('2020-08-19').getTime(),
        new Date('2020-08-20').getTime(),
        new Date('2020-08-21').getTime(),
      ],
      dayStart: new Date('1970-01-01T07:00:00.000+00:00').getTime(),
      dayEnd: new Date('1970-01-01T23:59:59.000+00:00').getTime(),
      timeStep: new Date('1970-01-01T00:15:00.000+00:00').getTime(),
    });
  }

  render() {
    const programs = this.state.programs;
    if (programs.length === 0)
      return null;

    const hour = new Date('1970-01-01T01:00:00.000+00:00').getTime();
    const width = Math.ceil((this.state.dayEnd - this.state.dayStart)/hour);
    const timeHeaders = Array.from(
      {length: width},
      (x,i) => new Date(this.state.dayStart + i*hour)
    );
    const days = this.state.days.map((day) => new Date(day));

    return (
      <div
        className="timetable"
        style={{
          gridTemplateRows: "repeat(" + (this.state.height + 1) + ", auto)",
          gridTemplateColumns: "auto repeat(" + (width + 1) + ", 1fr)",
        }}
      >
        {timeHeaders.map((time, idx) =>
          <TimeHeader
            key={time.toString()}
            time={time}
            pos={idx + 2}
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
            x={program.x + 1}
            y={program.y + 1}
            title={program.title}
          />
        )}
      </div>
    );
  }
}

function TimeHeader(props) {
  return (
    <div
      className="timetable-time"
      style={{
        gridColumnStart: props.pos
      }}
    >
      {props.time.toLocaleTimeString('cs-CZ', { timeZone: 'UTC' }).split(':', 2)[0]}
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
      {props.date.toLocaleDateString('cs-CZ', { dateStyle: 'short', timeZone: 'UTC' })
        .substring(0, 6)}
    </div>
  );
}

class Program extends React.Component {
  render() {
    return (
      <div
        className="timetable-program-wrapper"
        style={{
          gridColumnStart: this.props.x,
          gridRowStart: this.props.y,
        }}
      >
        <div className="timetable-program">
          {this.props.title}
        </div>
      </div>
    );
  }
}

export default App;
