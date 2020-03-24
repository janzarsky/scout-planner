import React from 'react';
import AddProgramModal from './AddProgramModal';
import EditProgramModal from './EditProgramModal';
import Timetable from './Timetable';
import Settings from './Settings';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
      pkgs: {},
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: 'settings',
    };
    this.updateProgram = this.updateProgram.bind(this);
    this.addProgram = this.addProgram.bind(this);
    this.addPkg = this.addPkg.bind(this);
  }

  componentDidMount() {
    fetch('http://localhost:4000/programs')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          programs: data.reduce((acc, cur) => ({ ...acc, [cur._id]: cur}), {}),
        });
      });

    fetch('http://localhost:4000/pkgs')
      .then(resp => resp.json())
      .then(data => {
        this.setState({
          pkgs: data.reduce((acc, cur) => ({ ...acc, [cur._id]: cur}), {}),
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
        <Tabs
          activeKey={this.state.activeTab}
          onSelect={(k) => this.setState({ activeTab: k })}
        >
          <Tab eventKey="timetable" title="Harmonogram">
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
          </Tab>
          <Tab eventKey="settings" title="Nastavení">
            <Container fluid>
              <Settings
                pkgs={this.state.pkgs}
              />
            </Container>
          </Tab>
        </Tabs>
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

  addPkg(pkg) {
    fetch('http://localhost:4000/pkgs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    })
    .then(resp => resp.json())
    .then(data => {
      let pkgs = this.state.pkgs;
      pkgs[pkg._id] = data;
      this.setState({ pkgs: pkgs });
    });
  }
}

export default App;
