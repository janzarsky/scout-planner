import React from 'react';
import AddProgramModal from './AddProgramModal';
import Timetable from './Timetable';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
      addProgram: false,
      addProgramOptions: {},
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
        {(this.state.addProgram) ?
          <AddProgramModal
            addProgram={this.addProgram}
            options={this.state.addProgramOptions}
            handleClose={() => this.setState({addProgram: false})}
          />
          : ''
        }
        <Timetable
          programs={this.state.programs}
          updateProgram={this.updateProgram}
          addProgramModal={(options) =>
            this.setState({addProgram: true, addProgramOptions: options})
          }
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
