import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { getRanges } from "../store/rangesSlice";
import { getGroups } from "../store/groupsSlice";
import { getPackages } from "../store/packagesSlice";
import { getRules } from "../store/rulesSlice";
import { getUsers } from "../store/usersSlice";
import { getPrograms } from "../store/programsSlice";

const config = require("../config.json");

export default function App(props) {
  const [this_state_violations, set_this_state_violations] = useState(
    new Map()
  );
  const [this_state_otherProblems, set_this_state_otherProblems] = useState([]);
  const [this_state_satisfied, set_this_state_satisfied] = useState(true);
  const [this_state_addProgram, set_this_state_addProgram] = useState(false);
  const [this_state_addProgramOptions, set_this_state_addProgramOptions] =
    useState({});
  const [this_state_editProgram, set_this_state_editProgram] = useState(false);
  const [this_state_editProgramData, set_this_state_editProgramData] = useState(
    {}
  );
  const [this_state_highlightingEnabled, set_this_state_highlightingEnabled] =
    useState(false);
  const [this_state_highlightedPackages, set_this_state_highlightedPackages] =
    useState([]);
  const [this_state_activeRange, set_this_state_activeRange] = useState(null);
  const [this_state_viewSettingsActive, set_this_state_viewSettingsActive] =
    useState(false);
  const [this_state_viewPkg, set_this_state_viewPkg] = useState(true);
  const [this_state_viewTime, set_this_state_viewTime] = useState(false);
  const [this_state_viewPeople, set_this_state_viewPeople] = useState(true);
  const [this_state_viewViolations, set_this_state_viewViolations] =
    useState(true);
  const [this_state_viewRanges, set_this_state_viewRanges] = useState(false);
  const [this_state_client, set_this_state_client] = useState(
    new Client(null, props.table)
  );
  const [this_state_userLevel, set_this_state_userLevel] = useState(level.NONE);
  const [this_state_loaded, set_this_state_loaded] = useState(false);
  const [this_state_errors, set_this_state_errors] = useState([]);

  const [this_auth, set_this_auth] = useState();
  const [this_provider, set_this_provider] = useState();

  const { groups: this_state_groups, loaded: groupsLoaded } = useSelector(
    (state) => state.groups
  );
  const { ranges: this_state_ranges, loaded: rangesLoaded } = useSelector(
    (state) => state.ranges
  );
  const { packages: this_state_pkgs, loaded: packagesLoaded } = useSelector(
    (state) => state.packages
  );
  const { rules: this_state_rules, loaded: rulesLoaded } = useSelector(
    (state) => state.rules
  );
  const { programs: this_state_programs, loaded: programsLoaded } = useSelector(
    (state) => state.programs
  );

  const dispatch = useDispatch();

  function getFilters() {
    const toggle = (id) => {
      let highlightedPackages = this_state_highlightedPackages;
      if (highlightedPackages.indexOf(id) === -1) highlightedPackages.push(id);
      else highlightedPackages.splice(highlightedPackages.indexOf(id), 1);
      set_this_state_highlightedPackages(highlightedPackages);
    };

    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this_state_highlightingEnabled ? "dark" : "light"}
            onClick={() =>
              set_this_state_highlightingEnabled(
                !this_state_highlightingEnabled
              )
            }
          >
            <i className="fa fa-filter" />
          </Nav.Link>
        </Nav.Item>
        {this_state_highlightingEnabled &&
          [...this_state_pkgs].sort(byName).map((pkg) => (
            <Nav.Item key={pkg._id}>
              <Nav.Link
                as={Button}
                variant={
                  this_state_highlightedPackages.indexOf(pkg._id) === -1
                    ? "light"
                    : "dark"
                }
                style={
                  this_state_highlightedPackages.indexOf(pkg._id) === -1
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

  function getViewSettings() {
    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this_state_viewSettingsActive ? "dark" : "light"}
            onClick={() =>
              set_this_state_viewSettingsActive(!this_state_viewSettingsActive)
            }
          >
            <i className="fa fa-eye" />
          </Nav.Link>
        </Nav.Item>
        {this_state_viewSettingsActive && (
          <>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this_state_viewPkg ? "dark" : "light"}
                onClick={() => set_this_state_viewPkg(!this_state_viewPkg)}
              >
                Balíček
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this_state_viewTime ? "dark" : "light"}
                onClick={() => set_this_state_viewTime(!this_state_viewTime)}
              >
                Čas
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this_state_viewPeople ? "dark" : "light"}
                onClick={() =>
                  set_this_state_viewPeople(!this_state_viewPeople)
                }
              >
                Lidi
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                as={Button}
                variant={this_state_viewViolations ? "dark" : "light"}
                onClick={() =>
                  set_this_state_viewViolations(!this_state_viewViolations)
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

  function getRangesElements() {
    return (
      <>
        <Nav.Item>
          <Nav.Link
            as={Button}
            variant={this_state_viewRanges ? "dark" : "light"}
            onClick={() => set_this_state_viewRanges(!this_state_viewRanges)}
          >
            <i className="fa fa-area-chart" />
          </Nav.Link>
        </Nav.Item>
        {this_state_viewRanges
          ? this_state_ranges.map((range) => (
              <Nav.Item key={range._id}>
                <Nav.Link
                  as={Button}
                  variant={
                    this_state_activeRange === range._id ? "dark" : "light"
                  }
                  onClick={() => set_this_state_activeRange(range._id)}
                >
                  {range.name}
                </Nav.Link>
              </Nav.Item>
            ))
          : null}
      </>
    );
  }

  function getGoogleLogin() {
    return this_auth && this_auth.currentUser ? (
      <Nav.Item>
        <Nav.Link as={Button} variant="light" onClick={logout}>
          {this_auth.currentUser.displayName}
          &nbsp;
          <i className="fa fa-sign-out" />
        </Nav.Link>
      </Nav.Item>
    ) : (
      <Nav.Item>
        <Nav.Link as={Button} variant="light" onClick={login}>
          <i className="fa fa-sign-in" />
        </Nav.Link>
      </Nav.Item>
    );
  }

  async function login() {
    await signInWithPopup(this_auth, this_provider).catch((error) =>
      console.error(error)
    );
  }

  async function logout() {
    await signOut(this_auth)
      .catch((error) => console.error(error))
      .finally(() => set_this_state_client(new Client(null, props.table)));
  }

  function handleError(error) {
    set_this_state_errors([error.message, ...this_state_errors]);
  }

  useEffect(() => {
    initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
    });
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    auth.onAuthStateChanged(async (user) => {
      const token = user ? await user.getIdToken() : null;
      set_this_state_client(new Client(token, props.table));
    });
    set_this_provider(provider);
    set_this_auth(auth);
  }, [props.table]);

  useEffect(() => {
    async function reloadData() {
      const permissions = await this_state_client.getPermissions();

      dispatch(getPrograms(this_state_client));
      dispatch(getRanges(this_state_client));
      dispatch(getGroups(this_state_client));
      dispatch(getPackages(this_state_client));
      dispatch(getRules(this_state_client));

      if (permissions.level >= level.ADMIN)
        dispatch(getUsers(this_state_client));

      set_this_state_userLevel(permissions.level);
    }
    reloadData();
  }, [this_state_client]);

  useEffect(() => {
    const problems = checkRules(this_state_rules, this_state_programs);

    set_this_state_violations(problems.violations);
    set_this_state_otherProblems(problems.other);
    set_this_state_satisfied(
      [...problems.violations.values()].reduce(
        (acc, curr) => acc && curr.satisfied,
        true
      ) && problems.other.length === 0
    );
  }, [
    this_state_loaded,
    this_state_programs,
    this_state_groups,
    this_state_pkgs,
    this_state_ranges,
  ]);

  useEffect(() => {
    if (
      programsLoaded &&
      rangesLoaded &&
      groupsLoaded &&
      packagesLoaded &&
      rulesLoaded
    )
      set_this_state_loaded(true);
  }, [programsLoaded, rangesLoaded, groupsLoaded, packagesLoaded, rulesLoaded]);

  var violationsPerProgram = new Map();
  [...this_state_violations.values()]
    .filter((val) => !val.satisfied)
    .map((val) => [val.program, val.msg])
    .forEach(([programId, msg]) => {
      if (!violationsPerProgram.get(programId))
        violationsPerProgram.set(programId, []);
      violationsPerProgram.get(programId).push(msg);
    });
  this_state_otherProblems.forEach((problem) => {
    if (!violationsPerProgram.get(problem.program))
      violationsPerProgram.set(problem.program, []);
    violationsPerProgram.get(problem.program).push(problem.msg);
  });

  const people = new Set(
    [...this_state_programs].flatMap((program) => program.people)
  );

  return (
    <div className="App">
      {this_state_errors.length > 0 && (
        <Container fluid className="notifications">
          <Alert
            variant="danger"
            dismissible
            onClose={() => set_this_state_errors(this_state_errors.slice(1))}
          >
            <i className="fa fa-exclamation-triangle" />
            &nbsp; {this_state_errors[0]}
          </Alert>
        </Container>
      )}
      {this_state_addProgram && (
        <AddProgramModal
          client={this_state_client}
          handleError={handleError}
          options={this_state_addProgramOptions}
          people={people}
          handleClose={() => set_this_state_addProgram(false)}
        />
      )}
      {this_state_editProgram && (
        <EditProgramModal
          client={this_state_client}
          handleError={handleError}
          program={this_state_editProgramData}
          people={people}
          handleClose={() => set_this_state_editProgram(false)}
          userLevel={this_state_userLevel}
        />
      )}
      <Tab.Container defaultActiveKey={"timetable"}>
        <Nav variant="pills" className="control-panel">
          <Nav.Item>
            <Nav.Link as={Button} variant="light" eventKey="timetable">
              Harmonogram
            </Nav.Link>
          </Nav.Item>
          {this_state_userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="rules">
                Pravidla{" "}
                {this_state_satisfied ? (
                  <i className="fa fa-check text-success" />
                ) : (
                  <i className="fa fa-times text-danger" />
                )}
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="packages">
                Balíčky
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="groups">
                Skupiny
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="ranges">
                Linky
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="stats">
                Statistiky
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.ADMIN && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="users">
                Uživatelé
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="settings">
                Nastavení
              </Nav.Link>
            </Nav.Item>
          )}
          {this_state_userLevel >= level.VIEW && getFilters()}
          {this_state_userLevel >= level.VIEW && getViewSettings()}
          {this_state_userLevel >= level.VIEW && getRangesElements()}
          {getGoogleLogin()}
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="timetable">
            {this_state_userLevel >= level.VIEW && this_state_loaded && (
              <Timetable
                violations={violationsPerProgram}
                highlightedPackages={
                  this_state_highlightingEnabled
                    ? this_state_highlightedPackages
                    : []
                }
                addProgramModal={(options) => {
                  set_this_state_addProgram(true);
                  set_this_state_addProgramOptions(options);
                }}
                onEdit={(program) => {
                  set_this_state_editProgram(true);
                  set_this_state_editProgramData(program);
                }}
                viewSettings={{
                  viewPkg: this_state_viewPkg,
                  viewTime: this_state_viewTime,
                  viewPeople: this_state_viewPeople,
                  viewViolations: this_state_viewViolations,
                }}
                activeRange={
                  this_state_viewRanges ? this_state_activeRange : null
                }
                userLevel={this_state_userLevel}
                client={this_state_client}
                handleError={handleError}
              />
            )}
            {!this_state_loaded && (
              <Container fluid>
                <Alert variant="primary">
                  <i className="fa fa-spinner fa-pulse" />
                  &nbsp; Načítání&hellip;
                </Alert>
              </Container>
            )}
            {this_state_userLevel === level.NONE && this_state_loaded && (
              <Container fluid>
                <Alert variant="danger">
                  <i className="fa fa-exclamation-triangle" />
                  &nbsp; Pro zobrazení tohoto harmonogramu nemáte dostatečná
                  oprávnění.
                </Alert>
              </Container>
            )}
          </Tab.Pane>
          {this_state_userLevel >= level.VIEW && (
            <Tab.Pane eventKey="rules">
              <Rules
                client={this_state_client}
                handleError={handleError}
                violations={this_state_violations}
                userLevel={this_state_userLevel}
              />
            </Tab.Pane>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Tab.Pane eventKey="packages" title="Balíčky">
              <Packages client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Tab.Pane eventKey="groups" title="Skupiny">
              <Groups client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {this_state_userLevel >= level.EDIT && (
            <Tab.Pane eventKey="ranges" title="Linky">
              <Ranges client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {this_state_userLevel >= level.VIEW && (
            <Tab.Pane eventKey="stats" title="Statistiky">
              <Stats people={people} />
            </Tab.Pane>
          )}
          {this_state_userLevel >= level.ADMIN && (
            <Tab.Pane eventKey="users" title="Uživatelé">
              <Users
                client={this_state_client}
                handleError={handleError}
                userEmail={
                  this_auth.currentUser ? this_auth.currentUser.email : null
                }
              />
            </Tab.Pane>
          )}
          <Tab.Pane eventKey="settings" title="Nastavení">
            <Settings
              client={this_state_client}
              handleError={handleError}
              userLevel={this_state_userLevel}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}
