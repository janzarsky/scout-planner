import React from "react";
import { AddProgramModal, EditProgramModal } from "./EditProgramModal";
import Timetable from "./Timetable";
import Packages from "./Packages";
import Groups from "./Groups";
import Ranges from "./Ranges";
import Rules from "./Rules";
import Tab from "react-bootstrap/Tab";
import Button from "react-bootstrap/Button";
import Nav from "react-bootstrap/Nav";
import Client from "../Client";
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
      ranges: [],
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
      activeRange: null,
      viewSettingsActive: false,
      viewPkg: true,
      viewTime: false,
      viewPeople: true,
      viewViolations: true,
      viewRanges: false,
    };
    this.addProgram = this.addProgram.bind(this);
    this.updateProgram = this.updateProgram.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.client = new Client(this.props.table);
  }

  componentDidMount() {
    this.client.getPrograms(this.props.table).then((allPrograms) =>
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
    this.client
      .getPackages(this.props.table)
      .then((pkgs) => this.setState({ pkgs: pkgs }));
    this.client
      .getRules(this.props.table)
      .then((rules) => this.setState({ rules: rules }, this.runChecker));
    this.client
      .getGroups(this.props.table)
      .then((groups) => this.setState({ groups: groups }, this.runChecker));
    this.client
      .getRanges(this.props.table)
      .then((ranges) => this.setState({ ranges: ranges }));
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
            ranges={this.state.ranges}
          />
        )}
        {this.state.editProgram && (
          <EditProgramModal
            updateProgram={this.updateProgram}
            deleteProgram={this.deleteProgram}
            program={this.state.editProgramData}
            pkgs={this.state.pkgs}
            groups={this.state.groups}
            ranges={this.state.ranges}
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
              <Nav.Link as={Button} variant="light" eventKey="ranges">
                Linky
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="importexport">
                Import/Export
              </Nav.Link>
            </Nav.Item>
            {this.getFilters()}
            {this.getViewSettings()}
            {this.getRanges()}
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
                  viewViolations: this.state.viewViolations,
                }}
                clone={(program) => this.addProgram(program)}
                activeRange={
                  this.state.viewRanges ? this.state.activeRange : null
                }
              />
            </Tab.Pane>
            <Tab.Pane eventKey="rules">
              <Rules
                programs={this.state.programs}
                groups={this.state.groups}
                rules={this.state.rules}
                violations={this.state.violations}
                addRule={(rule) =>
                  this.client
                    .addRule(rule)
                    .then((rule) =>
                      this.setState(
                        { rules: [...this.state.rules, rule] },
                        this.runChecker
                      )
                    )
                }
                updateRule={(rule) =>
                  this.client.updateRule(rule).then((rule) =>
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
                  this.client
                    .deleteRule(id)
                    .then((msg) =>
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
                  this.client
                    .addPackage(pkg)
                    .then((pkg) =>
                      this.setState(
                        { pkgs: [...this.state.pkgs, pkg] },
                        this.runChecker
                      )
                    )
                }
                updatePkg={(pkg) =>
                  this.client.updatePackage(pkg).then((pkg) =>
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
                  this.client
                    .deletePackage(id)
                    .then((msg) =>
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
                  this.client.addGroup(group).then((group) =>
                    this.setState(
                      {
                        groups: [...this.state.groups, group],
                      },
                      this.runChecker
                    )
                  )
                }
                updateGroup={(group) =>
                  this.client.updateGroup(group).then((group) =>
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
                  this.client.deleteGroup(id).then(() =>
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
            <Tab.Pane eventKey="ranges" title="Linky">
              <Ranges
                ranges={this.state.ranges}
                addRange={(range) =>
                  this.client.addRange(range).then((range) =>
                    this.setState({
                      ranges: [...this.state.ranges, range],
                    })
                  )
                }
                updateRange={(range) =>
                  this.client.updateRange(range).then((range) =>
                    this.setState({
                      ranges: [
                        ...this.state.ranges.filter((r) => r._id !== range._id),
                        range,
                      ],
                    })
                  )
                }
                deleteRange={(id) =>
                  this.client.deleteRange(id).then(() =>
                    this.setState({
                      ranges: [
                        ...this.state.ranges.filter((r) => r._id !== id),
                      ],
                    })
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
                ranges={this.state.ranges}
                client={new Client(this.props.table)}
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
          [...this.state.pkgs]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((pkg) => (
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
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this.state.viewViolations ? "dark" : "light"}
                onClick={() =>
                  this.setState({ viewViolations: !this.state.viewViolations })
                }
              >
                Porušení pravidel
              </Nav.Link>
            </Nav.Item>
          </>
        )}
      </>
    );
  }

  getRanges() {
    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this.state.viewRanges ? "dark" : "light"}
            onClick={() =>
              this.setState({ viewRanges: !this.state.viewRanges })
            }
          >
            <i className="fa fa-area-chart" />
          </Nav.Link>
        </Nav.Item>
        {this.state.viewRanges
          ? this.state.ranges.map((range) => (
              <Nav.Item key={range._id}>
                <Nav.Link
                  as={Button}
                  variant={
                    this.state.activeRange === range._id ? "dark" : "light"
                  }
                  onClick={() => this.setState({ activeRange: range._id })}
                >
                  {range.name}
                </Nav.Link>
              </Nav.Item>
            ))
          : null}
      </>
    );
  }

  addProgram(program) {
    this.client
      .addProgram(program)
      .then((program) =>
        this.setState(
          { programs: [...this.state.programs, program] },
          this.runChecker
        )
      );
  }

  updateProgram(program) {
    this.client.updateProgram(program).then((program) =>
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
    this.client.updateProgram({ ...program, deleted: true }).then(() =>
      this.setState({
        programs: [...this.state.programs.filter((p) => p._id !== program._id)],
        deletedPrograms: [...this.state.deletedPrograms, program],
      })
    );
  }
}
