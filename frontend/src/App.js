import React from 'react';
import AddProgramModal from './AddProgramModal';
import EditProgramModal from './EditProgramModal';
import Timetable from './Timetable';
import Packages from './Packages';
import Rules from './Rules';
import Tab from 'react-bootstrap/Tab';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Data from './Data';
import Checker from './Checker';
import Example from './Example';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: new Map(),
      pkgs: new Map(),
      rules: new Map(),
      violations: new Map(),
      satisfied: true,
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: 'timetable',
      filterActive: false,
      filterPkgs: [],
    };
    this.addProgram = this.addProgram.bind(this);
    this.updateProgram = this.updateProgram.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.loadTestData = this.loadTestData.bind(this);
    this.removeAll = this.removeAll.bind(this);
  }

  loadTestData() {
    Example.clear()
      .then(() => Example.load())
      .then(() => this.componentDidMount());
  }

  removeAll() {
    Example.clear().then(() => this.componentDidMount());
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
        satisfied: [...violations.values()].reduce((acc, curr) => (acc && curr.satisfied), true),
      });
    });
  }

  render() {
    var violationsPerProgram = new Map();
    [...this.state.violations.values()].filter((val) => !val.satisfied)
      .map((val) => [val.program, val.msg])
      .forEach(([programId, msg]) => {
        if (!violationsPerProgram.get(programId))
          violationsPerProgram.set(programId, []);
        violationsPerProgram.get(programId).push(msg);
      });

    return (
      <div className="App">
        {this.state.addProgram &&
          <AddProgramModal
            addProgram={this.addProgram}
            options={this.state.addProgramOptions}
            pkgs={this.state.pkgs}
            handleClose={() => this.setState({ addProgram: false })}
          />
        }
        {this.state.editProgram &&
          <EditProgramModal
            updateProgram={this.updateProgram}
            deleteProgram={this.deleteProgram}
            program={this.state.editProgramData}
            pkgs={this.state.pkgs}
            handleClose={() => this.setState({ editProgram: false })}
          />
        }
        <Tab.Container defaultActiveKey={this.state.activeTab}>
          <Nav variant="pills" className="control-panel">
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="timetable">Harmonogram</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="rules">Pravidla {this.state.satisfied
                ? <i className="fa fa-check text-success" />
                : <i className="fa fa-times text-danger" />}</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="packages">Balíčky</Nav.Link>
            </Nav.Item>
            {this.getFilters()}
            <Nav.Item style={{marginLeft: 'auto'}}>
              <Nav.Link as={Button} variant="light" onClick={this.loadTestData}>
                Nahrát příklad
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" onClick={this.removeAll}>Smazat vše</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="timetable">
              <Timetable
                programs={this.state.programs}
                pkgs={this.state.pkgs}
                settings={this.state.settings}
                violations={violationsPerProgram}
                filterPkgs={this.state.filterActive ? this.state.filterPkgs : []}
                updateProgram={this.updateProgram}
                addProgramModal={options =>
                  this.setState({ addProgram: true, addProgramOptions: options })
                }
                editProgramModal={program =>
                  this.setState({ editProgram: true, editProgramData: program })
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="rules">
              <Rules
                programs={this.state.programs}
                rules={this.state.rules}
                violations={this.state.violations}
                addRule={rule => Data.addRule(rule).then(rule => {
                  const rules = new Map(this.state.rules);
                  rules.set(rule._id, rule);
                  this.setState({ rules: rules }, this.checkRules);
                })}
                updateRule={rule => Data.updateRule(rule).then(rule => {
                  const rules = new Map(this.state.rules);
                  rules.set(rule._id, rule);
                  this.setState({ rules: rules }, this.checkRules);
                })}
                deleteRule={id => Data.deleteRule(id).then(msg => {
                  const rules = new Map(this.state.rules);
                  rules.delete(id);
                  this.setState({ rules: rules }, this.checkRules);
                })}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="packages" title="Balíčky">
              <Packages
                pkgs={this.state.pkgs}
                addPkg={pkg => Data.addPkg(pkg).then(pkg => {
                  const pkgs = new Map(this.state.pkgs);
                  pkgs.set(pkg._id, pkg);
                  this.setState({ pkgs: pkgs });
                })}
                updatePkg={pkg => Data.updatePkg(pkg).then(pkg => {
                  const pkgs = new Map(this.state.pkgs);
                  pkgs.set(pkg._id, pkg);
                  this.setState({ pkgs: pkgs });
                })}
                deletePkg={id => Data.deletePkg(id).then(msg => {
                  const pkgs = new Map(this.state.pkgs);
                  pkgs.delete(id);
                  this.setState({ pkgs: pkgs });
                })}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    );
  }

  getFilters() {
    const toggle = (id) => {
      let filterPkgs = this.state.filterPkgs;
      if (filterPkgs.indexOf(id) === -1)
        filterPkgs.push(id);
      else
        filterPkgs.splice(filterPkgs.indexOf(id), 1);
      this.setState({ filterPkgs: filterPkgs });
    };

    return <>
      <Nav.Item>
        <Nav.Link
          as={Button}
          variant={this.state.filterActive ? 'dark' : 'light'}
          onClick={() => this.setState({ filterActive: this.state.filterActive ? false : true })}
        ><i className="fa fa-filter"/></Nav.Link>
      </Nav.Item>
      {this.state.filterActive && [...this.state.pkgs.entries()].map(([key, pkg]) =>
        <Nav.Item key={key}>
          <Nav.Link
            as={Button}
            variant={(this.state.filterPkgs.indexOf(pkg._id) === -1) ? 'light' : 'dark'}
            style={(this.state.filterPkgs.indexOf(pkg._id) === -1) ? { backgroundColor: pkg.color } : {}}
            onClick={() => toggle(pkg._id)}
          >{pkg.name}</Nav.Link>
        </Nav.Item>
      )}
    </>;
  }

  addProgram(program) {
    Data.addProgram(program).then(program => {
      const programs = new Map(this.state.programs);
      programs.set(program._id, program);
      this.setState({ programs: programs }, this.checkRules);
    });
  }

  updateProgram(program) {
    Data.updateProgram(program).then(program => {
      const programs = new Map(this.state.programs);
      programs.set(program._id, program);
      this.setState({ programs: programs }, this.checkRules);
    });
  }

  deleteProgram(id) {
    Data.deleteProgram(id).then(msg => {
      const programs = this.state.programs;
      programs.delete(id);
      this.setState({ programs: programs });
    });
  }
}

export default App;
