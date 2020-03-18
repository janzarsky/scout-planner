import React from 'react';
import AddProgramModal from './AddProgramModal';
import EditProgramModal from './EditProgramModal';
import Timetable from './Timetable';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
      pkgs: {
        'or': { _id:'or', name:'Oddílové rady', color:'#ffe082' },
        'hosp': { _id:'hosp', name:'Hospodaření', color:'#c5e1a5' },
        'psy': { _id:'psy', name:'Psychologie', color:'#80cbc4' },
      },
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
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
            pkgs={this.state.pkgs}
            handleClose={() => this.setState({addProgram: false})}
          />
          : ''
        }
        {(this.state.editProgram) ?
          <EditProgramModal
            updateProgram={this.updateProgram}
            program={this.state.editProgramData}
            pkgs={this.state.pkgs}
            handleClose={() => this.setState({editProgram: false})}
          />
          : ''
        }
        <Timetable
          programs={this.state.programs}
          pkgs={this.state.pkgs}
          updateProgram={this.updateProgram}
          addProgramModal={(options) =>
            this.setState({addProgram: true, addProgramOptions: options})
          }
          editProgramModal={(program) =>
            this.setState({editProgram: true, editProgramData: program})
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
