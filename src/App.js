import React from 'react';
import ControlPanel from './ControlPanel';
import Timetable from './Timetable';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
    };
    this.updateProgram = this.updateProgram.bind(this);
    this.addProgram = this.addProgram.bind(this);
  }

  componentDidMount() {
    fetch('http://localhost:4000/programs')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          programs: data.reduce((acc, cur) => ({ ...acc, [cur._id]: cur}), {}),
        });
      });
  }

  render() {
    return (
      <div className="App">
        <ControlPanel
          addProgram={this.addProgram}
        />
        <Timetable
          programs={this.state.programs}
          updateProgram={this.updateProgram}
        />
      </div>
    );
  }

  addProgram(program) {
    fetch('http://localhost:4000/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program),
    })
    .then(resp => resp.json())
    .then(data => {
      let programs = this.state.programs;
      programs[program._id] = data;
      this.setState({ programs: programs });
    });
  }

  updateProgram(program) {
    fetch('http://localhost:4000/programs/' + program._id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(program),
    })
    .then(resp => resp.json())
    .then(data => {
      let programs = this.state.programs;
      programs[program._id] = data;
      this.setState({ programs: programs });
    });
  }
}

export default App;
