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
        <ControlPanel />
        <Timetable
          programs={this.state.programs}
          updateProgram={this.updateProgram}
        />
      </div>
    );
  }

  updateProgram(program) {
    let programs = this.state.programs;
    programs[program._id] = program;
    this.setState({
      programs: programs,
    });
  }
}

export default App;
