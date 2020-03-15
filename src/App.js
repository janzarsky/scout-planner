import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import './App.css';

function App() {
  return (
    <div className="App">
      <ControlPanel />
      <Timetable />
    </div>
  );
}

class ControlPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addProgram: false,
    };
    ['title', 'date', 'time', 'duration'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <div className="control-panel">
        <Button
          variant="primary"
          onClick={(_) => this.addProgram()}
        >
          Přidat
        </Button>
        {(this.state.addProgram) ? this.getAddProgram() : ''}
      </div>
    );
  }

  getAddProgram() {
    const handleClose = () => this.setState({addProgram: false});
    return (
      <Modal show={true} onHide={handleClose}>
        <Form onSubmit={this.handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Title</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Název</Form.Label>
              <Form.Control type="text" ref={this.title} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Začátek</Form.Label>
              <Form.Control type="text" ref={this.date} placeholder="YYYY-MM-DD" />
              <Form.Control type="text" ref={this.time} placeholder="MM:HH" />
            </Form.Group>
            <Form.Group>
              <Form.Label>Délka</Form.Label>
              <Form.Control type="text" ref={this.duration} placeholder="MM:HH" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="link" onClick={handleClose}>
              Zrušit
            </Button>
            <Button variant="primary" type="submit">
              Přidat
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    fetch('http://localhost:4000/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        begin: Date.parse(this.date.current.value + 'T' + this.time.current.value + ':00.000+00:00'),
        duration: Date.parse('1970-01-01T' + this.duration.current.value + ':00.000+00:00'),
        title: this.title.current.value,
      }),
    });

    this.setState({addProgram: false});
  }

  addProgram() {
    this.setState({addProgram: true});
  }
}

class Timetable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: [],
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

  componentDidMount() {
    fetch('http://localhost:4000/programs')
      .then(resp => resp.json())
      .then(data => this.setState({ programs: data }));
  }

  render() {
    const programs = this.state.programs;

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
                begin={new Date(date.getTime() + time.getTime() + span)}
                onDrop={this.onDroppableDrop}
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
        {programs.map((program) =>
          <Program
            key={program._id}
            program={program}
            rect={this.getRect(program)}
            onDragStart={this.onProgramDragStart}
            people={this.state.people}
            pkgs={this.state.pkgs}
          />
        )}
      </div>
    );
  }

  onProgramDragStart(id) {
    this.draggedProgram = id;
  }

  onDroppableDrop(begin) {
    var programs = this.state.programs.slice();
    const idx = programs.findIndex((p) => p.id === this.draggedProgram);
    var newProg = programs[idx];
    newProg.begin = begin;
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

class Program extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragged: false,
      modal: false,
    };
  }

  render() {
    if (this.props.rect.x < 0 || this.props.rect.y < 0)
      return null;

    const program = this.props.program;
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
        {(this.state.modal) ? this.getModal() : ''}
        <div className="timetable-program">
          <div className="program-text">
            <h3>{program.title}</h3>
            <p className="program-package">
              {this.props.pkgs[program.pkg]}
            </p>
            <p className="program-people">
              {program.people.map((p) => this.props.people[p]).join(', ')}
            </p>
            <p className="program-time">
              {new Date(program.begin).getUTCHours()}:
              {new Date(program.begin).getUTCMinutes().toString().padStart(2, 0)}&ndash;
              {new Date(program.begin + program.duration).getUTCHours()}:
              {new Date(program.begin + program.duration).getUTCMinutes().toString().padStart(2, 0)}
            </p>
          </div>
        </div>
        <div
          className="program-modal"
          onClick={(_) => this.setState({modal: true}) }
        >
          <i className="fa fa-info-circle"></i>
        </div>
      </div>
    );
  }

  getModal() {
    const handleClose = () => this.setState({modal: false});
    return (
      <Modal show={true} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Title</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {JSON.stringify(this.props.program)}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Uložit
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  onDragStart(e) {
    this.props.onDragStart(this.props.program.id);
    this.setState({ dragged: true });
  }

  onDragEnd(e) {
    e.preventDefault();
    this.setState({ dragged: false });
  }
}

export default App;
