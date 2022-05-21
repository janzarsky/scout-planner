import React from "react";
import { AddProgramModal, EditProgramModal } from "./EditProgramModal";
import Timetable from "./Timetable";
import Packages from "./Packages";
import Groups from "./Groups";
import Rules from "./Rules";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Data from "../Client";
import { checkRules } from "../Checker";
import ImportExport from "../ImportExport";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      programs: [],
      deletedPrograms: [],
      pkgs: [],
      groups: [],
      rules: [],
      violations: new Map(),
      otherProblems: [],
      satisfied: true,
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: "timetable",
      filterActive: false,
      filterPkgs: [],
      viewSettingsActive: false,
      viewPkg: true,
      viewTime: false,
      viewPeople: true,
    };
    this.addProgram = this.addProgram.bind(this);
    this.updateProgram = this.updateProgram.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
  }

  componentDidMount() {
    Data.getPrograms(this.props.table).then((allPrograms) =>
      this.setState(
        {
          programs: [...allPrograms].filter((program) => !program.deleted),
          deletedPrograms: [...allPrograms].filter(
            (program) => program.deleted
          ),
        },
        this.runChecker
      )
    );
    Data.getPackages(this.props.table).then((pkgs) =>
      this.setState({ pkgs: pkgs })
    );
    Data.getRules(this.props.table).then((rules) =>
      this.setState({ rules: rules }, this.runChecker)
    );
    Data.getGroups(this.props.table).then((groups) =>
      this.setState({ groups: groups }, this.runChecker)
    );
  }

  runChecker() {
    checkRules(this.state.rules, this.state.programs).then((problems) => {
      this.setState({
        violations: problems.violations,
        otherProblems: problems.other,
        satisfied:
          [...problems.violations.values()].reduce(
            (acc, curr) => acc && curr.satisfied,
            true
          ) && problems.other.length === 0,
      });
    });
  }

  render() {
    var violationsPerProgram = new Map();
    [...this.state.violations.values()]
      .filter((val) => !val.satisfied)
      .map((val) => [val.program, val.msg])
      .forEach(([programId, msg]) => {
        if (!violationsPerProgram.get(programId))
          violationsPerProgram.set(programId, []);
        violationsPerProgram.get(programId).push(msg);
      });
    this.state.otherProblems.forEach((problem) => {
      if (!violationsPerProgram.get(problem.program))
        violationsPerProgram.set(problem.program, []);
      violationsPerProgram.get(problem.program).push(problem.msg);
    });

    const people = new Set(
      [...this.state.programs].flatMap((program) => program.people)
    );

    return (
      <div className="App">
        {this.state.addProgram && (
          <AddProgramModal
            addProgram={this.addProgram}
            options={this.state.addProgramOptions}
            pkgs={this.state.pkgs}
            people={people}
            handleClose={() => this.setState({ addProgram: false })}
            groups={this.state.groups}
          />
        )}
        {this.state.editProgram && (
          <EditProgramModal
            updateProgram={this.updateProgram}
            deleteProgram={this.deleteProgram}
            program={this.state.editProgramData}
            pkgs={this.state.pkgs}
            groups={this.state.groups}
            people={people}
            handleClose={() => this.setState({ editProgram: false })}
          />
        )}
        <Tab.Container defaultActiveKey={this.state.activeTab}>
          <Nav variant="pills" className="control-panel">
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="timetable">
                Harmonogram
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="rules">
                Pravidla{" "}
                {this.state.satisfied ? (
                  <i className="fa fa-check text-success" />
                ) : (
                  <i className="fa fa-times text-danger" />
                )}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="packages">
                Balíčky
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="groups">
                Skupiny
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="importexport">
                Import/Export
              </Nav.Link>
            </Nav.Item>
            {this.getFilters()}
            {this.getViewSettings()}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="timetable">
              <Timetable
                programs={this.state.programs}
                pkgs={this.state.pkgs}
                groups={this.state.groups}
                settings={this.state.settings}
                violations={violationsPerProgram}
                filterPkgs={
                  this.state.filterActive ? this.state.filterPkgs : []
                }
                updateProgram={this.updateProgram}
                addProgramModal={(options) =>
                  this.setState({
                    addProgram: true,
                    addProgramOptions: options,
                  })
                }
                editProgramModal={(program) =>
                  this.setState({ editProgram: true, editProgramData: program })
                }
                viewSettings={{
                  viewPkg: this.state.viewPkg,
                  viewTime: this.state.viewTime,
                  viewPeople: this.state.viewPeople,
                }}
                clone={(program) => this.addProgram(program)}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="rules">
              <Rules
                programs={this.state.programs}
                groups={this.state.groups}
                rules={this.state.rules}
                violations={this.state.violations}
                addRule={(rule) =>
                  Data.addRule(this.props.table, rule).then((rule) =>
                    this.setState(
                      { rules: [...this.state.rules, rule] },
                      this.runChecker
                    )
                  )
                }
                updateRule={(rule) =>
                  Data.updateRule(this.props.table, rule).then((rule) =>
                    this.setState(
                      {
                        rules: [
                          ...this.state.rules.filter((r) => r._id !== rule._id),
                          rule,
                        ],
                      },
                      this.runChecker
                    )
                  )
                }
                deleteRule={(id) =>
                  Data.deleteRule(this.props.table, id).then((msg) =>
                    this.setState(
                      { rules: this.state.rules.filter((r) => r._id !== id) },
                      this.runChecker
                    )
                  )
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="packages" title="Balíčky">
              <Packages
                pkgs={this.state.pkgs}
                addPkg={(pkg) =>
                  Data.addPackage(this.props.table, pkg).then((pkg) =>
                    this.setState(
                      { pkgs: [...this.state.pkgs, pkg] },
                      this.runChecker
                    )
                  )
                }
                updatePkg={(pkg) =>
                  Data.updatePackage(this.props.table, pkg).then((pkg) =>
                    this.setState(
                      {
                        pkgs: [
                          ...this.state.pkgs.filter((p) => p._id !== pkg._id),
                          pkg,
                        ],
                      },
                      this.runChecker
                    )
                  )
                }
                deletePkg={(id) =>
                  Data.deletePackage(this.props.table, id).then((msg) =>
                    this.setState(
                      { pkgs: this.state.pkgs.filter((p) => p._id !== id) },
                      this.runChecker
                    )
                  )
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="groups" title="Skupiny">
              <Groups
                groups={this.state.groups}
                addGroup={(group) =>
                  Data.addGroup(this.props.table, group).then((group) =>
                    this.setState(
                      {
                        groups: [...this.state.groups, group],
                      },
                      this.runChecker
                    )
                  )
                }
                updateGroup={(group) =>
                  Data.updateGroup(this.props.table, group).then((group) =>
                    this.setState(
                      {
                        groups: [
                          ...this.state.groups.filter(
                            (g) => g._id !== group._id
                          ),
                          group,
                        ],
                      },
                      this.runChecker
                    )
                  )
                }
                deleteGroup={(id) =>
                  Data.deleteGroup(this.props.table, id).then(() =>
                    this.setState(
                      {
                        groups: [
                          ...this.state.groups.filter((g) => g._id !== id),
                        ],
                      },
                      this.runChecker
                    )
                  )
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="importexport" title="Import/Export">
              <ImportExport
                programs={[
                  ...this.state.programs,
                  ...this.state.deletedPrograms,
                ]}
                pkgs={this.state.pkgs}
                groups={this.state.groups}
                rules={this.state.rules}
                table={this.props.table}
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
      if (filterPkgs.indexOf(id) === -1) filterPkgs.push(id);
      else filterPkgs.splice(filterPkgs.indexOf(id), 1);
      this.setState({ filterPkgs: filterPkgs });
    };

    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this.state.filterActive ? "dark" : "light"}
            onClick={() =>
              this.setState({
                filterActive: this.state.filterActive ? false : true,
              })
            }
          >
            <i className="fa fa-filter" />
          </Nav.Link>
        </Nav.Item>
        {this.state.filterActive &&
          this.state.pkgs.map((pkg) => (
            <Nav.Item key={pkg._id}>
              <Nav.Link
                as={Button}
                variant={
                  this.state.filterPkgs.indexOf(pkg._id) === -1
                    ? "light"
                    : "dark"
                }
                style={
                  this.state.filterPkgs.indexOf(pkg._id) === -1
                    ? { backgroundColor: pkg.color }
                    : {}
                }
                onClick={() => toggle(pkg._id)}
              >
                {pkg.name}
              </Nav.Link>
            </Nav.Item>
          ))}
      </>
    );
  }

  getViewSettings() {
    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this.state.viewSettingsActive ? "dark" : "light"}
            onClick={() =>
              this.setState({
                viewSettingsActive: this.state.viewSettingsActive
                  ? false
                  : true,
              })
            }
          >
            <i className="fa fa-eye" />
          </Nav.Link>
        </Nav.Item>
        {this.state.viewSettingsActive && (
          <>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this.state.viewPkg ? "dark" : "light"}
                onClick={() => this.setState({ viewPkg: !this.state.viewPkg })}
              >
                Balíček
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this.state.viewTime ? "dark" : "light"}
                onClick={() =>
                  this.setState({ viewTime: !this.state.viewTime })
                }
              >
                Čas
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this.state.viewPeople ? "dark" : "light"}
                onClick={() =>
                  this.setState({ viewPeople: !this.state.viewPeople })
                }
              >
                Lidi
              </Nav.Link>
            </Nav.Item>
          </>
        )}
      </>
    );
  }

  addProgram(program) {
    Data.addProgram(this.props.table, program).then((program) =>
      this.setState(
        { programs: [...this.state.programs, program] },
        this.runChecker
      )
    );
  }

  updateProgram(program) {
    Data.updateProgram(this.props.table, program).then((program) =>
      this.setState(
        {
          programs: [
            ...this.state.programs.filter((p) => p._id !== program._id),
            program,
          ],
        },
        this.runChecker
      )
    );
  }

  deleteProgram(program) {
    Data.updateProgram(this.props.table, { ...program, deleted: true }).then(
      () =>
        this.setState({
          programs: [
            ...this.state.programs.filter((p) => p._id !== program._id),
          ],
          deletedPrograms: [...this.state.deletedPrograms, program],
        })
    );
  }
}
