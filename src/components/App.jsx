import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddProgramModal, EditProgramModal } from "./EditProgramModal";
import Timetable from "./Timetable";
import Packages from "./Packages";
import Groups from "./Groups";
import People from "./People";
import Ranges from "./Ranges";
import Rules from "./Rules";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Alert from "react-bootstrap/Alert";
import { firestoreClientFactory } from "../FirestoreClient";
import { checkRules } from "../Checker";
import Settings from "./Settings";
import Users from "./Users";
import Stats from "./Stats";
import { level } from "../helpers/Level";
import Container from "react-bootstrap/esm/Container";
import { getRanges } from "../store/rangesSlice";
import { getGroups } from "../store/groupsSlice";
import { getPackages } from "../store/packagesSlice";
import { getRules } from "../store/rulesSlice";
import { getUsers } from "../store/usersSlice";
import { getPrograms } from "../store/programsSlice";
import { getPermissions, setAuthenticated } from "../store/authSlice";
import { PackageFilter, PackageFilterToggle } from "./PackageFilter";
import { ViewSettings, ViewSettingsToggle } from "./ViewSettings";
import { RangesSettings, RangesSettingsToggle } from "./RangesSettings";
import { addError, removeError } from "../store/errorsSlice";
import { getSettings } from "../store/settingsSlice";
import { getPeople, setLegacyPeople } from "../store/peopleSlice";
import {
  convertLegacyPeople,
  replaceLegacyPeopleInPrograms,
} from "../helpers/PeopleConvertor";
import { useAuth } from "./AuthProvider";
import { NavLink, Route, Routes } from "react-router-dom";
import { PeopleFilter, PeopleFilterToggle } from "./PeopleFilter";

export default function App() {
  const [violations, setViolations] = useState(new Map());
  const [otherProblems, setOtherProblems] = useState([]);
  const [rulesSatisfied, setRulesSatisfied] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { user, initializing } = useAuth();

  const { groups, loaded: groupsLoaded } = useSelector((state) => state.groups);
  const { ranges, loaded: rangesLoaded } = useSelector((state) => state.ranges);
  const { packages, loaded: packagesLoaded } = useSelector(
    (state) => state.packages,
  );
  const { rules, loaded: rulesLoaded } = useSelector((state) => state.rules);
  const { programs, loaded: programsLoaded } = useSelector(
    (state) => state.programs,
  );
  const {
    people,
    legacyPeople,
    loaded: peopleLoaded,
  } = useSelector((state) => state.people);
  const { settings, loaded: settingsLoaded } = useSelector(
    (state) => state.settings,
  );
  const { table, userLevel, permissionsLoaded } = useSelector(
    (state) => state.auth,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!permissionsLoaded && !initializing) {
      const client = firestoreClientFactory.getClient(table);
      dispatch(getPermissions(client));
    }
  }, [table, permissionsLoaded, initializing, dispatch]);

  useEffect(() => {
    if (permissionsLoaded) {
      const client = firestoreClientFactory.getClient(table);

      if (userLevel >= level.NONE) {
        dispatch(getPrograms(client));
        dispatch(getRanges(client));
        dispatch(getGroups(client));
        dispatch(getPackages(client));
        dispatch(getRules(client));
        dispatch(getPeople(client));
        dispatch(getSettings(client));
      }

      if (userLevel >= level.ADMIN) dispatch(getUsers(client));
    }
  }, [table, userLevel, permissionsLoaded, dispatch]);

  useEffect(() => {
    const allPeople = convertLegacyPeople(legacyPeople, people);
    const convertedPrograms = replaceLegacyPeopleInPrograms(
      programs,
      allPeople,
    );

    const problems = checkRules(rules, convertedPrograms, people);

    setViolations(problems.violations);
    setOtherProblems(problems.other);
    setRulesSatisfied(
      [...problems.violations.values()].reduce(
        (acc, curr) => acc && curr.satisfied,
        true,
      ) && problems.other.length === 0,
    );
  }, [
    table,
    dataLoaded,
    userLevel,
    programs,
    groups,
    packages,
    ranges,
    legacyPeople,
    people,
    rules,
    settings,
    dispatch,
  ]);

  useEffect(() => {
    if (
      (permissionsLoaded && userLevel === level.NONE) ||
      (programsLoaded &&
        rangesLoaded &&
        groupsLoaded &&
        packagesLoaded &&
        rulesLoaded &&
        peopleLoaded &&
        settingsLoaded)
    )
      setDataLoaded(true);
  }, [
    programsLoaded,
    rangesLoaded,
    groupsLoaded,
    packagesLoaded,
    rulesLoaded,
    peopleLoaded,
    settingsLoaded,
    permissionsLoaded,
    userLevel,
  ]);

  const violationsPerProgram = useMemo(() => {
    var tmp = new Map();
    [...violations.values()]
      .filter((val) => !val.satisfied)
      .map((val) => [val.program, val])
      .forEach(([programId, violation]) => {
        if (!tmp.get(programId)) tmp.set(programId, []);
        tmp.get(programId).push(violation);
      });
    otherProblems.forEach((problem) => {
      if (!tmp.get(problem.program)) tmp.set(problem.program, []);
      tmp.get(problem.program).push(problem);
    });
    return tmp;
  }, [violations, otherProblems]);

  useEffect(() => {
    const people = [
      ...new Set(
        [...programs].flatMap((program) =>
          program.people.filter((person) => typeof person === "string"),
        ),
      ),
    ];
    dispatch(setLegacyPeople(people));
  }, [programs, dispatch]);

  const peopleFilter = useSelector((state) => state.config.peopleFilter);

  return (
    <div className="App">
      <Notifications />
      <Routes>
        <Route path="add" element={<AddProgramModal />} />
        <Route path="edit/:id" element={<EditProgramModal />} />
      </Routes>
      <NavBar rulesSatisfied={rulesSatisfied} />
      <Container fluid className="ms-0 me-0 mb-1">
        <Routes>
          <Route
            index
            element={
              <>
                {userLevel >= level.VIEW && <PackageFilter />}
                {peopleFilter && userLevel >= level.VIEW && <PeopleFilter />}
                {userLevel >= level.VIEW && <ViewSettings />}
                {userLevel >= level.VIEW && <RangesSettings />}
              </>
            }
          />
        </Routes>
      </Container>
      <Routes>
        <Route
          index
          element={
            <TimetableWrapper
              dataLoaded={dataLoaded}
              violationsPerProgram={violationsPerProgram}
            />
          }
        />
        <Route
          path="add"
          element={
            <TimetableWrapper
              dataLoaded={dataLoaded}
              violationsPerProgram={violationsPerProgram}
            />
          }
        />
        <Route
          path="edit/*"
          element={
            <TimetableWrapper
              dataLoaded={dataLoaded}
              violationsPerProgram={violationsPerProgram}
            />
          }
        />
        <Route
          path="rules"
          element={userLevel >= level.VIEW && <Rules violations={violations} />}
        />
        <Route
          path="packages"
          element={userLevel >= level.EDIT && <Packages />}
        />
        <Route path="groups" element={userLevel >= level.EDIT && <Groups />} />
        <Route path="people" element={userLevel >= level.EDIT && <People />} />
        <Route path="ranges" element={userLevel >= level.EDIT && <Ranges />} />
        <Route path="stats" element={userLevel >= level.VIEW && <Stats />} />
        <Route
          path="users"
          element={
            userLevel >= level.ADMIN && (
              <Users userEmail={user ? user.email : null} />
            )
          }
        />
        <Route path="settings" element={<Settings />} />
      </Routes>
      <PrintCss />
    </div>
  );
}

function Notifications() {
  const errors = useSelector((state) => state.errors);
  const dispatch = useDispatch();

  if (errors.length === 0) return null;

  return (
    <Container fluid className="notifications">
      <Alert
        variant="danger"
        dismissible
        onClose={() => dispatch(removeError())}
      >
        <i className="fa fa-exclamation-triangle" />
        &nbsp; {errors[0]}
      </Alert>
    </Container>
  );
}

function NavBar({ rulesSatisfied }) {
  const userLevel = useSelector((state) => state.auth.userLevel);
  const peopleFilter = useSelector((state) => state.config.peopleFilter);

  return (
    <Navbar bg="light" className="control-panel" expand="lg">
      <Container fluid className="ps-0 pe-0">
        <Nav.Link as={NavLink} to="" end>
          Harmonogram
        </Nav.Link>
        <Navbar.Toggle
          aria-controls="navbar-toggle"
          data-test="navbar-toggle"
        />
        <Navbar.Collapse id="navbar-toggle">
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to="rules">
              Pravidla{" "}
              {rulesSatisfied ? (
                <i className="fa fa-check text-success" />
              ) : (
                <i className="fa fa-times text-danger" />
              )}
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <Nav.Link as={NavLink} to="stats" end>
              Statistiky
            </Nav.Link>
          )}
          {userLevel >= level.VIEW && (
            <NavDropdown title="Nastavení">
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="packages" end>
                  Balíčky
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="groups" end>
                  Skupiny
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="people" end>
                  Organizátoři
                </NavDropdown.Item>
              )}
              {userLevel >= level.EDIT && (
                <NavDropdown.Item as={NavLink} to="ranges" end>
                  Linky
                </NavDropdown.Item>
              )}
              {userLevel >= level.ADMIN && (
                <NavDropdown.Item as={NavLink} to="users" end>
                  Uživatelé
                </NavDropdown.Item>
              )}
              {userLevel >= level.VIEW && (
                <NavDropdown.Item as={NavLink} to="settings" end>
                  Nastavení
                </NavDropdown.Item>
              )}
            </NavDropdown>
          )}
          <Routes>
            <Route
              index
              element={
                <>
                  {userLevel >= level.VIEW && <PackageFilterToggle />}
                  {peopleFilter && userLevel >= level.VIEW && (
                    <PeopleFilterToggle />
                  )}
                  {userLevel >= level.VIEW && <ViewSettingsToggle />}
                  {userLevel >= level.VIEW && <RangesSettingsToggle />}
                </>
              }
            />
          </Routes>
          <GoogleLogin />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function GoogleLogin() {
  const dispatch = useDispatch();
  const { user, login, logout } = useAuth();

  return !!user ? (
    <Nav.Link
      variant="light"
      data-test="auth-logout-button"
      className="ms-auto"
      onClick={() =>
        logout()
          .then(() => dispatch(setAuthenticated(false)))
          .catch((e) => dispatch(addError(e.message)))
      }
    >
      {user.displayName}
      &nbsp;
      <i className="fa fa-sign-out" />
    </Nav.Link>
  ) : (
    <Nav.Link
      variant="light"
      data-test="auth-login-button"
      className="ms-auto"
      onClick={() =>
        login()
          .then(() => dispatch(setAuthenticated(true)))
          .catch((e) => dispatch(addError(e.message)))
      }
    >
      <i className="fa fa-sign-in" />
    </Nav.Link>
  );
}

function TimetableWrapper({ violationsPerProgram, dataLoaded }) {
  const userLevel = useSelector((state) => state.auth.userLevel);

  return (
    <>
      {userLevel >= level.VIEW && dataLoaded && (
        <Timetable violations={violationsPerProgram} />
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
    </>
  );
}

function PrintCss({ preset = "default" }) {
  const presets = {
    a4: { pageSize: "a4", fontSize: "6pt", margin: "6mm" },
    a4landscape: { pageSize: "a4 landscape", fontSize: "6pt", margin: "6mm" },
    a3: { pageSize: "a3", fontSize: "9pt", margin: "10mm" },
    a3landscape: { pageSize: "a3 landscape", fontSize: "9pt", margin: "10mm" },
    a2: { pageSize: "420mm 594mm", fontSize: "11pt", margin: "10mm" },
    default: { pageSize: "800mm 1108mm", fontSize: "12pt", margin: "10mm" },
  };

  return (
    <style>
      {`@page{ size: ${presets[preset].pageSize}; margin: ${presets[preset].margin}; }` +
        `@media print{ html{ font-size: ${presets[preset].fontSize}; }}`}
    </style>
  );
}

export const testing = {
  NavBar,
  GoogleLogin,
};
