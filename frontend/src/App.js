import React from 'react';
import AddProgramModal from './AddProgramModal';
import EditProgramModal from './EditProgramModal';
import Timetable from './Timetable';
import Packages from './Packages';
import Rules from './Rules';
import Tab from 'react-bootstrap/Tab';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Data from './Data.js';
import Checker from './Checker.js';
import Example from './Example.js';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: {},
      pkgs: {},
      rules: {},
      settings: {},
      violations: {},
      satisfied: true,
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: 'timetable',
    };
    this.addProgram = this.addProgram.bind(this);
    this.updateProgram = this.updateProgram.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.loadTestData = this.loadTestData.bind(this);
    this.removeAll = this.removeAll.bind(this);
  }

  loadTestData() {
    Example.clear()
      .then(_ => Example.load())
      .then(_ => this.componentDidMount());
  }

  removeAll() {
    Example.clear().then(_ => this.componentDidMount());
  }

  componentDidMount() {
    Data.getPrograms().then(programs => this.setState({programs: programs}, this.checkRules));
    Data.getPkgs().then(pkgs => this.setState({pkgs: pkgs}));
    Data.getRules().then(rules => this.setState({rules: rules}, this.checkRules));
  }

  checkRules() {
    Checker.checkRules(this.state.rules, this.state.programs).then(violations => {
      this.setState({
        violations: violations,
        satisfied: Object.values(violations).reduce((acc, curr) => (acc && curr.satisfied), true),
      });
    });
  }

  render() {
    var violationsPerProgram = {};
    Object.values(this.state.violations).filter((val) => !val.satisfied)
      .map((val) => [val.program, val.msg])
      .forEach(([programId, msg]) => {
        if (!violationsPerProgram[programId])
          violationsPerProgram[programId] = [];
        violationsPerProgram[programId].push(msg);
      });

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
            deleteProgram={this.deleteProgram}
            program={this.state.editProgramData}
            pkgs={this.state.pkgs}
            handleClose={() => this.setState({editProgram: false})}
          />
          : ''
        }
        <Tab.Container
          defaultActiveKey={this.state.activeTab}
        >
          <Nav variant="pills">
            <Nav.Item><Nav.Link eventKey="timetable">Harmonogram</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="rules">Pravidla {this.state.satisfied
                  ? <i className="fa fa-check" />
                  : <i className="fa fa-times" />}</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link eventKey="packages">Balíčky</Nav.Link></Nav.Item>
            <Nav.Item style={{marginLeft: 'auto'}}>
              <Button onClick={this.loadTestData}>Nahrát příklad</Button>
            </Nav.Item>
            <Nav.Item><Button onClick={this.removeAll}>Smazat vše</Button></Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="timetable">
              <Timetable
                programs={this.state.programs}
                pkgs={this.state.pkgs}
                settings={this.state.settings}
                violations={violationsPerProgram}
                updateProgram={this.updateProgram}
                addProgramModal={(options) =>
                  this.setState({addProgram: true, addProgramOptions: options})
                }
                editProgramModal={(program) =>
                  this.setState({editProgram: true, editProgramData: program})
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="rules">
              <Container fluid>
                <Rules
                  programs={this.state.programs}
                  rules={this.state.rules}
                  violations={this.state.violations}
                  addRule={(rule) => Data.addRule(rule).then(rule =>
                    this.setState(
                      { rules: { ...this.state.rules, [rule._id]: rule } },
                      this.checkRules
                    )
                  )}
                  updateRule={(rule) => Data.updateRule(rule).then(rule =>
                    this.setState(
                      { rules: { ...this.state.rules, [rule._id]: rule } },
                      this.checkRules
                    )
                  )}
                  deleteRule={(id) => Data.deleteRule(id).then(msg => {
                    const { [id]: _, ...rules } = this.state.rules;
                    this.setState({ rules: rules }, this.checkRules);
                  })}
                />
              </Container>
            </Tab.Pane>
            <Tab.Pane eventKey="packages" title="Balíčky">
              <Container fluid>
                <Packages
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
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    );
  }

  addProgram(program) {
    Data.addProgram(program).then(program => {
      this.setState({ programs: { ...this.state.programs, [program._id]: program } }, this.checkRules);
    });
  }

  updateProgram(program) {
    Data.updateProgram(program).then(program => {
      this.setState({ programs: { ...this.state.programs, [program._id]: program } }, this.checkRules);
    });
  }

  deleteProgram(id) {
    Data.deleteProgram(id).then(msg => {
      const { [id]: _, ...programs } = this.state.programs;
      this.setState({ programs: programs });
    });
  }
}

export default App;
