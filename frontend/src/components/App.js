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
import { getRanges } from "../store/rangesSlice";
import { getGroups } from "../store/groupsSlice";
import { getPackages } from "../store/packagesSlice";
import { getRules } from "../store/rulesSlice";
import { getUsers } from "../store/usersSlice";
import { getPrograms } from "../store/programsSlice";
import Filters from "./Filters";
import ViewSettings from "./ViewSettings";
import RangesSettings from "./RangesSettings";

const config = require("../config.json");

export default function App(props) {
  const [violations, setViolations] = useState(new Map());
  const [otherProblems, setOtherProblems] = useState([]);
  const [rulesSatisfied, setRulesSatisfied] = useState(true);
  const [addModalEnabled, setAddModalEnabled] = useState(false);
  const [addProgramOptions, setAddProgramOptions] = useState({});
  const [editProgramId, setEditProgramId] = useState(undefined);
  const [this_state_client, set_this_state_client] = useState(
    new Client(null, props.table)
  );
  const [userLevel, setUserLevel] = useState(level.NONE);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [errors, setErrors] = useState([]);

  const [auth, setAuth] = useState();
  const [provider, setProvider] = useState();

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

  async function login() {
    await signInWithPopup(auth, provider).catch((error) =>
      console.error(error)
    );
  }

  async function logout() {
    await signOut(auth)
      .catch((error) => console.error(error))
      .finally(() => set_this_state_client(new Client(null, props.table)));
  }

  function handleError(error) {
    setErrors([error.message, ...errors]);
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
    setProvider(provider);
    setAuth(auth);
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

      setUserLevel(permissions.level);
    }
    reloadData();
  }, [this_state_client, dispatch]);

  useEffect(() => {
    const problems = checkRules(this_state_rules, this_state_programs);

    setViolations(problems.violations);
    setOtherProblems(problems.other);
    setRulesSatisfied(
      [...problems.violations.values()].reduce(
        (acc, curr) => acc && curr.satisfied,
        true
      ) && problems.other.length === 0
    );
  }, [
    dataLoaded,
    this_state_programs,
    this_state_groups,
    this_state_pkgs,
    this_state_ranges,
    this_state_rules,
  ]);

  useEffect(() => {
    if (
      programsLoaded &&
      rangesLoaded &&
      groupsLoaded &&
      packagesLoaded &&
      rulesLoaded
    )
      setDataLoaded(true);
  }, [programsLoaded, rangesLoaded, groupsLoaded, packagesLoaded, rulesLoaded]);

  var violationsPerProgram = new Map();
  [...violations.values()]
    .filter((val) => !val.satisfied)
    .map((val) => [val.program, val.msg])
    .forEach(([programId, msg]) => {
      if (!violationsPerProgram.get(programId))
        violationsPerProgram.set(programId, []);
      violationsPerProgram.get(programId).push(msg);
    });
  otherProblems.forEach((problem) => {
    if (!violationsPerProgram.get(problem.program))
      violationsPerProgram.set(problem.program, []);
    violationsPerProgram.get(problem.program).push(problem.msg);
  });

  const people = new Set(
    [...this_state_programs].flatMap((program) => program.people)
  );

  return (
    <div className="App">
      {errors.length > 0 && (
        <Container fluid className="notifications">
          <Alert
            variant="danger"
            dismissible
            onClose={() => setErrors(errors.slice(1))}
          >
            <i className="fa fa-exclamation-triangle" />
            &nbsp; {errors[0]}
          </Alert>
        </Container>
      )}
      {addModalEnabled && (
        <AddProgramModal
          client={this_state_client}
          handleError={handleError}
          options={addProgramOptions}
          people={people}
          handleClose={() => setAddModalEnabled(false)}
        />
      )}
      {editProgramId && (
        <EditProgramModal
          client={this_state_client}
          handleError={handleError}
          programId={editProgramId}
          people={people}
          handleClose={() => setEditProgramId(undefined)}
          userLevel={userLevel}
        />
      )}
      <Tab.Container defaultActiveKey={"timetable"}>
        <Nav variant="pills" className="control-panel">
          <Nav.Item>
            <Nav.Link as={Button} variant="light" eventKey="timetable">
              Harmonogram
            </Nav.Link>
          </Nav.Item>
          {userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="rules">
                Pravidla{" "}
                {rulesSatisfied ? (
                  <i className="fa fa-check text-success" />
                ) : (
                  <i className="fa fa-times text-danger" />
                )}
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="packages">
                Balíčky
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="groups">
                Skupiny
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.EDIT && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="ranges">
                Linky
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="stats">
                Statistiky
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.ADMIN && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="users">
                Uživatelé
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.VIEW && (
            <Nav.Item>
              <Nav.Link as={Button} variant="light" eventKey="settings">
                Nastavení
              </Nav.Link>
            </Nav.Item>
          )}
          {userLevel >= level.VIEW && <Filters />}
          {userLevel >= level.VIEW && <ViewSettings />}
          {userLevel >= level.VIEW && <RangesSettings />}
          <GoogleLogin
            authenticated={auth && auth.currentUser}
            name={auth && auth.currentUser && auth.currentUser.displayName}
            login={login}
            logout={logout}
          />
        </Nav>
        <Tab.Content>
          <Tab.Pane eventKey="timetable">
            {userLevel >= level.VIEW && dataLoaded && (
              <Timetable
                violations={violationsPerProgram}
                addProgramModal={(options) => {
                  setAddModalEnabled(true);
                  setAddProgramOptions(options);
                }}
                onEdit={(program) => setEditProgramId(program._id)}
                userLevel={userLevel}
                client={this_state_client}
                handleError={handleError}
              />
            )}
            {!dataLoaded && (
              <Container fluid>
                <Alert variant="primary">
                  <i className="fa fa-spinner fa-pulse" />
                  &nbsp; Načítání&hellip;
                </Alert>
              </Container>
            )}
            {userLevel === level.NONE && dataLoaded && (
              <Container fluid>
                <Alert variant="danger">
                  <i className="fa fa-exclamation-triangle" />
                  &nbsp; Pro zobrazení tohoto harmonogramu nemáte dostatečná
                  oprávnění.
                </Alert>
              </Container>
            )}
          </Tab.Pane>
          {userLevel >= level.VIEW && (
            <Tab.Pane eventKey="rules">
              <Rules
                client={this_state_client}
                handleError={handleError}
                violations={violations}
                userLevel={userLevel}
              />
            </Tab.Pane>
          )}
          {userLevel >= level.EDIT && (
            <Tab.Pane eventKey="packages" title="Balíčky">
              <Packages client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {userLevel >= level.EDIT && (
            <Tab.Pane eventKey="groups" title="Skupiny">
              <Groups client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {userLevel >= level.EDIT && (
            <Tab.Pane eventKey="ranges" title="Linky">
              <Ranges client={this_state_client} handleError={handleError} />
            </Tab.Pane>
          )}
          {userLevel >= level.VIEW && (
            <Tab.Pane eventKey="stats" title="Statistiky">
              <Stats people={people} />
            </Tab.Pane>
          )}
          {userLevel >= level.ADMIN && (
            <Tab.Pane eventKey="users" title="Uživatelé">
              <Users
                client={this_state_client}
                handleError={handleError}
                userEmail={auth.currentUser ? auth.currentUser.email : null}
              />
            </Tab.Pane>
          )}
          <Tab.Pane eventKey="settings" title="Nastavení">
            <Settings
              client={this_state_client}
              handleError={handleError}
              userLevel={userLevel}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
}

function GoogleLogin({ authenticated, name, login, logout }) {
  return authenticated ? (
    <Nav.Item>
      <Nav.Link as={Button} variant="light" onClick={logout}>
        {name}
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
