import React from 'react';
import AddProgramModal from './AddProgramModal';
import EditProgramModal from './EditProgramModal';
import Timetable from './Timetable';
import Settings from './Settings';
import Rules from './Rules';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import Data from './Data.js';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
      pkgs: {},
      rules: {},
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: 'timetable',
    };
    this.updateProgram = this.updateProgram.bind(this);
    this.addProgram = this.addProgram.bind(this);
  }

  componentDidMount() {
    Data.getPrograms().then(programs => this.setState({programs: programs}));
    Data.getPkgs().then(pkgs => this.setState({pkgs: pkgs}));
    Data.getRules().then(rules => this.setState({rules: rules}));
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
          <Tab eventKey="rules" title="Pravidla">
            <Container fluid>
              <Rules
                programs={this.state.programs}
                rules={this.state.rules}
                addRule={(rule) => Data.addRule(rule).then(rule =>
                  this.setState({ rules: { ...this.state.rules, [rule._id]: rule } })
                )}
                updateRule={(rule) => Data.updateRule(rule).then(rule =>
                  this.setState({ rules: { ...this.state.rules, [rule._id]: rule } })
                )}
                deleteRule={(id) => Data.deleteRule(id).then(msg => {
                  const { [id]: _, ...rules } = this.state.rules;
                  this.setState({ rules: rules });
                })}
              />
            </Container>
          </Tab>
          <Tab eventKey="settings" title="Nastavení">
            <Container fluid>
              <Settings
                pkgs={this.state.pkgs}
                addPkg={(pkg) => Data.addPkg(pkg).then(pkg =>
                  this.setState({ pkgs: { ...this.state.pkgs, [pkg._id]: pkg } })
                )}
                updatePkg={(pkg) => Data.updatePkg(pkg).then(pkg =>
                  this.setState({ pkgs: { ...this.state.pkgs, [pkg._id]: pkg } })
                )}
                deletePkg={(id) => Data.deletePkg(id).then(msg => {
                  const { [id]: _, ...pkgs } = this.state.pkgs;
                  this.setState({ pkgs: pkgs });
                })}
              />
            </Container>
          </Tab>
        </Tabs>
      </div>
    );
  }

  addProgram(program) {
    Data.addProgram(program).then(program => {
      this.setState({ programs: { ...this.state.programs, [program._id]: program } });
    });
  }

  updateProgram(program) {
    Data.updateProgram(program).then(program => {
      this.setState({ programs: { ...this.state.programs, [program._id]: program } });
    });
  }
}

export default App;
