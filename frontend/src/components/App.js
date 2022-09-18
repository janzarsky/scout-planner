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
import Alert from "react-bootstrap/Alert";
import Client from "../Client";
import { checkRules } from "../Checker";
import Settings from "./Settings";
import Users from "./Users";
import Stats from "./Stats";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { level } from "../helpers/Level";
import Container from "react-bootstrap/esm/Container";
import { byName } from "../helpers/Sorting";

const config = require("../config.json");

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
      users: [],
      violations: new Map(),
      otherProblems: [],
      satisfied: true,
      addProgram: false,
      addProgramOptions: {},
      editProgram: false,
      editProgramData: {},
      activeTab: "timetable",
      highlightingEnabled: false,
      highlightedPackages: [],
      activeRange: null,
      viewSettingsActive: false,
      viewPkg: true,
      viewTime: false,
      viewPeople: true,
      viewViolations: true,
      viewRanges: false,
      client: new Client(null, this.props.table),
      userLevel: level.NONE,
      settings: {},
    };
    this.addProgram = this.addProgram.bind(this);
    this.updateProgram = this.updateProgram.bind(this);
    this.deleteProgram = this.deleteProgram.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);

    this.app = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
    });
    this.provider = new GoogleAuthProvider();
    this.auth = getAuth();
    this.auth.onAuthStateChanged(async (user) => {
      const token = user ? await user.getIdToken() : null;
      this.setState(
        {
          client: new Client(token, this.props.table),
        },
        this.reloadData
      );
    });
  }

  async reloadData() {
    const permissions = await this.state.client.getPermissions();

    const viewData =
      permissions.level > level.NONE
        ? Promise.all([
            this.state.client.getPrograms(),
            this.state.client.getPackages(),
            this.state.client.getRules(),
            this.state.client.getGroups(),
            this.state.client.getRanges(),
            this.state.client.getSettings(),
          ])
        : Promise.resolve([[], [], [], [], [], []]);

    const adminData =
      permissions.level >= level.ADMIN
        ? this.state.client.getUsers()
        : Promise.resolve([]);

    Promise.all([viewData, adminData]).then(
      ([[allPrograms, pkgs, rules, groups, ranges, settings], users]) => {
        this.setState(
          {
            programs: [...allPrograms].filter((program) => !program.deleted),
            deletedPrograms: [...allPrograms].filter(
              (program) => program.deleted
            ),
            pkgs: pkgs,
            rules: rules,
            groups: groups,
            ranges: ranges,
            users: users,
            settings: settings,
          },
          this.runChecker
        );
      }
    );

    this.setState({ userLevel: permissions.level });
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
            userLevel={this.state.userLevel}
          />
        )}
        <Tab.Container defaultActiveKey={this.state.activeTab}>
          <Nav variant="pills" className="control-panel">
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="timetable">
                Harmonogram
              </Nav.Link>
            </Nav.Item>
            {this.state.userLevel >= level.VIEW && (
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
            )}
            {this.state.userLevel >= level.EDIT && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="packages">
                  Balíčky
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.EDIT && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="groups">
                  Skupiny
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.EDIT && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="ranges">
                  Linky
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.VIEW && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="stats">
                  Statistiky
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.ADMIN && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="users">
                  Uživatelé
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.VIEW && (
              <Nav.Item>
                <Nav.Link as={Button} variant="light" eventKey="settings">
                  Nastavení
                </Nav.Link>
              </Nav.Item>
            )}
            {this.state.userLevel >= level.VIEW && this.getFilters()}
            {this.state.userLevel >= level.VIEW && this.getViewSettings()}
            {this.state.userLevel >= level.VIEW && this.getRanges()}
            {this.getGoogleLogin()}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="timetable">
              {this.state.userLevel >= level.VIEW && (
                <Timetable
                  programs={this.state.programs}
                  pkgs={this.state.pkgs}
                  groups={this.state.groups}
                  settings={this.state.settings}
                  timeStep={
                    this.state.settings.timeStep
                      ? this.state.settings.timeStep
                      : 15 * 60 * 1000
                  }
                  violations={violationsPerProgram}
                  highlightedPackages={
                    this.state.highlightingEnabled
                      ? this.state.highlightedPackages
                      : []
                  }
                  updateProgram={this.updateProgram}
                  addProgramModal={(options) =>
                    this.setState({
                      addProgram: true,
                      addProgramOptions: options,
                    })
                  }
                  onEdit={(program) =>
                    this.setState({
                      editProgram: true,
                      editProgramData: program,
                    })
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
                  userLevel={this.state.userLevel}
                />
              )}
              {this.state.userLevel === level.NONE && (
                <Container fluid>
                  <Alert variant="danger">
                    <i className="fa fa-exclamation-triangle" />
                    &nbsp; Pro zobrazení tohoto harmonogramu nemáte dostatečná
                    oprávnění.
                  </Alert>
                </Container>
              )}
            </Tab.Pane>
            {this.state.userLevel >= level.VIEW && (
              <Tab.Pane eventKey="rules">
                <Rules
                  programs={this.state.programs}
                  groups={this.state.groups}
                  rules={this.state.rules}
                  violations={this.state.violations}
                  userLevel={this.state.userLevel}
                  addRule={(rule) =>
                    this.state.client
                      .addRule(rule)
                      .then((rule) =>
                        this.setState(
                          { rules: [...this.state.rules, rule] },
                          this.runChecker
                        )
                      )
                  }
                  updateRule={(rule) =>
                    this.state.client.updateRule(rule).then((rule) =>
                      this.setState(
                        {
                          rules: [
                            ...this.state.rules.filter(
                              (r) => r._id !== rule._id
                            ),
                            rule,
                          ],
                        },
                        this.runChecker
                      )
                    )
                  }
                  deleteRule={(id) =>
                    this.state.client.deleteRule(id).then((msg) =>
                      this.setState(
                        {
                          rules: this.state.rules.filter((r) => r._id !== id),
                        },
                        this.runChecker
                      )
                    )
                  }
                />
              </Tab.Pane>
            )}
            {this.state.userLevel >= level.EDIT && (
              <Tab.Pane eventKey="packages" title="Balíčky">
                <Packages
                  pkgs={this.state.pkgs}
                  addPkg={(pkg) =>
                    this.state.client
                      .addPackage(pkg)
                      .then((pkg) =>
                        this.setState(
                          { pkgs: [...this.state.pkgs, pkg] },
                          this.runChecker
                        )
                      )
                  }
                  updatePkg={(pkg) =>
                    this.state.client.updatePackage(pkg).then((pkg) =>
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
                    this.state.client
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
            )}
            {this.state.userLevel >= level.EDIT && (
              <Tab.Pane eventKey="groups" title="Skupiny">
                <Groups
                  groups={this.state.groups}
                  addGroup={(group) =>
                    this.state.client.addGroup(group).then((group) =>
                      this.setState(
                        {
                          groups: [...this.state.groups, group],
                        },
                        this.runChecker
                      )
                    )
                  }
                  updateGroup={(group) =>
                    this.state.client.updateGroup(group).then((group) =>
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
                    this.state.client.deleteGroup(id).then(() =>
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
            )}
            {this.state.userLevel >= level.EDIT && (
              <Tab.Pane eventKey="ranges" title="Linky">
                <Ranges
                  ranges={this.state.ranges}
                  addRange={(range) =>
                    this.state.client.addRange(range).then((range) =>
                      this.setState({
                        ranges: [...this.state.ranges, range],
                      })
                    )
                  }
                  updateRange={(range) =>
                    this.state.client.updateRange(range).then((range) =>
                      this.setState({
                        ranges: [
                          ...this.state.ranges.filter(
                            (r) => r._id !== range._id
                          ),
                          range,
                        ],
                      })
                    )
                  }
                  deleteRange={(id) =>
                    this.state.client.deleteRange(id).then(() =>
                      this.setState({
                        ranges: [
                          ...this.state.ranges.filter((r) => r._id !== id),
                        ],
                      })
                    )
                  }
                />
              </Tab.Pane>
            )}
            {this.state.userLevel >= level.VIEW && (
              <Tab.Pane eventKey="stats" title="Statistiky">
                <Stats
                  programs={this.state.programs}
                  people={people}
                  groups={this.state.groups}
                  packages={this.state.pkgs}
                />
              </Tab.Pane>
            )}
            {this.state.userLevel >= level.ADMIN && (
              <Tab.Pane eventKey="users" title="Uživatelé">
                <Users
                  users={this.state.users}
                  addUser={(user) =>
                    this.state.client.addUser(user).then((user) =>
                      this.setState({
                        users: [...this.state.users, user],
                      })
                    )
                  }
                  updateUser={(user) =>
                    this.state.client.updateUser(user).then((user) =>
                      this.setState({
                        users: [
                          ...this.state.users.filter((u) => u._id !== user._id),
                          user,
                        ],
                      })
                    )
                  }
                  deleteUser={(id) =>
                    this.state.client.deleteUser(id).then(() =>
                      this.setState({
                        users: [
                          ...this.state.users.filter((u) => u._id !== id),
                        ],
                      })
                    )
                  }
                />
              </Tab.Pane>
            )}
            <Tab.Pane eventKey="settings" title="Nastavení">
              <Settings
                programs={[
                  ...this.state.programs,
                  ...this.state.deletedPrograms,
                ]}
                pkgs={this.state.pkgs}
                groups={this.state.groups}
                rules={this.state.rules}
                ranges={this.state.ranges}
                users={this.state.users}
                client={this.state.client}
                userLevel={this.state.userLevel}
                timeStep={
                  this.state.settings.timeStep
                    ? this.state.settings.timeStep
                    : 15 * 60 * 1000
                }
                updateTimeStep={(timeStep) => {
                  this.state.client
                    .updateSettings({ ...this.state.settings, timeStep })
                    .then(() =>
                      this.setState({
                        settings: { ...this.state.settings, timeStep },
                      })
                    );
                }}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </div>
    );
  }

  getFilters() {
    const toggle = (id) => {
      let highlightedPackages = this.state.highlightedPackages;
      if (highlightedPackages.indexOf(id) === -1) highlightedPackages.push(id);
      else highlightedPackages.splice(highlightedPackages.indexOf(id), 1);
      this.setState({ highlightedPackages });
    };

    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this.state.highlightingEnabled ? "dark" : "light"}
            onClick={() =>
              this.setState({
                highlightingEnabled: this.state.highlightingEnabled
                  ? false
                  : true,
              })
            }
          >
            <i className="fa fa-filter" />
          </Nav.Link>
        </Nav.Item>
        {this.state.highlightingEnabled &&
          [...this.state.pkgs].sort(byName).map((pkg) => (
            <Nav.Item key={pkg._id}>
              <Nav.Link
                as={Button}
                variant={
                  this.state.highlightedPackages.indexOf(pkg._id) === -1
                    ? "light"
                    : "dark"
                }
                style={
                  this.state.highlightedPackages.indexOf(pkg._id) === -1
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

  getGoogleLogin() {
    return this.auth.currentUser ? (
      <Nav.Item>
        <Nav.Link as={Button} variant="light" onClick={this.logout}>
          {this.auth.currentUser.displayName}
          &nbsp;
          <i className="fa fa-sign-out" />
        </Nav.Link>
      </Nav.Item>
    ) : (
      <Nav.Item>
        <Nav.Link as={Button} variant="light" onClick={this.login}>
          <i className="fa fa-sign-in" />
        </Nav.Link>
      </Nav.Item>
    );
  }

  addProgram(program) {
    this.state.client
      .addProgram(program)
      .then((program) =>
        this.setState(
          { programs: [...this.state.programs, program] },
          this.runChecker
        )
      );
  }

  updateProgram(program) {
    this.state.client.updateProgram(program).then((program) =>
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
    this.state.client.updateProgram({ ...program, deleted: true }).then(() =>
      this.setState({
        programs: [...this.state.programs.filter((p) => p._id !== program._id)],
        deletedPrograms: [...this.state.deletedPrograms, program],
      })
    );
  }

  async login() {
    await signInWithPopup(this.auth, this.provider).catch((error) =>
      console.error(error)
    );
  }

  async logout() {
    await signOut(this.auth)
      .catch((error) => console.error(error))
      .finally(() => {
        this.setState({ client: new Client(null, this.props.table) });
      });
  }
}
