import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AddProgramModal, EditProgramModal } from "./EditProgramModal";
import Timetable from "./Timetable";
import TimetableV2 from "./TimetableV2";
import Packages from "./Packages";
import Groups from "./Groups";
import People from "./People";
import Ranges from "./Ranges";
import Rules from "./Rules";
import About from "./About";
import Alert from "react-bootstrap/Alert";
import { firestoreClientFactory } from "../FirestoreClient";
import { checkRules } from "../Checker";
import Settings from "./Settings";
import Users from "./Users";
import Stats from "./Stats";
import { level } from "../helpers/Level";
import Container from "react-bootstrap/esm/Container";
import { getPermissions } from "../store/authSlice";
import { PackageFilter } from "./PackageFilter";
import { ViewSettings } from "./ViewSettings";
import { RangesSettings } from "./RangesSettings";
import { useAuth } from "./AuthProvider";
import { Route, Routes } from "react-router";
import { PeopleFilter } from "./PeopleFilter";
import { PrintWrapper } from "./PrintOptions";
import { Notifications } from "./Notifications";
import { NavBar } from "./NavBar";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useGetPeopleQuery } from "../store/peopleApi";
import { useGetRulesQuery } from "../store/rulesApi";
import { useGetTimetableQuery } from "../store/timetableApi";
import { useGetSettingsQuery } from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";

export default function App() {
  const [violations, setViolations] = useState(new Map());
  const [otherProblems, setOtherProblems] = useState([]);
  const [rulesSatisfied, setRulesSatisfied] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const { user, initializing } = useAuth();

  const { table, userLevel, permissionsLoaded } = useSelector(
    (state) => state.auth,
  );

  const { isSuccess: groupsLoaded } = useGetGroupsQuery(table);
  const { isSuccess: rangesLoaded } = useGetRangesQuery(table);
  const { isSuccess: packagesLoaded } = useGetPackagesQuery(table);
  const { data: rules, isSuccess: rulesLoaded } = useGetRulesQuery(table);
  const { data: programs, isSuccess: programsLoaded } =
    useGetProgramsQuery(table);
  const { data: people, isSuccess: peopleLoaded } = useGetPeopleQuery(table);
  const { isSuccess: settingsLoaded } = useGetSettingsQuery(table);
  const { data: timetable, isSuccess: timetableLoaded } =
    useGetTimetableQuery(table);

  const dispatch = useDispatch();

  useEffect(() => {
    document.title =
      timetableLoaded && timetable.title
        ? `${timetable.title} – Skautský plánovač`
        : "Skautský plánovač";
  }, [timetable]);

  useEffect(() => {
    if (!permissionsLoaded && !initializing) {
      const client = firestoreClientFactory.getClient(table);
      dispatch(getPermissions(client));
    }
  }, [table, permissionsLoaded, initializing, dispatch]);

  useEffect(() => {
    if (rulesLoaded && programsLoaded && peopleLoaded) {
      const problems = checkRules(rules, programs, people);

      setViolations(problems.violations);
      setOtherProblems(problems.other);
      setRulesSatisfied(
        [...problems.violations.values()].reduce(
          (acc, curr) => acc && curr.satisfied,
          true,
        ) && problems.other.length === 0,
      );
    }
  }, [
    rulesLoaded,
    programsLoaded,
    peopleLoaded,
    programs,
    people,
    rules,
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
        settingsLoaded &&
        timetableLoaded)
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
    timetableLoaded,
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

  return (
    <div className="app">
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
                {userLevel >= level.VIEW && <PeopleFilter />}
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
              userLevel={userLevel}
              permissionsLoaded={permissionsLoaded}
              violationsPerProgram={violationsPerProgram}
            />
          }
        />
        <Route
          path="add"
          element={
            <TimetableWrapper
              dataLoaded={dataLoaded}
              userLevel={userLevel}
              permissionsLoaded={permissionsLoaded}
              violationsPerProgram={violationsPerProgram}
            />
          }
        />
        <Route
          path="edit/*"
          element={
            <TimetableWrapper
              dataLoaded={dataLoaded}
              userLevel={userLevel}
              permissionsLoaded={permissionsLoaded}
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
        <Route
          path="print"
          element={
            <PrintWrapper
              dataLoaded={dataLoaded}
              permissionsLoaded={permissionsLoaded}
              violationsPerProgram={violationsPerProgram}
              userLevel={userLevel}
            />
          }
        />
        <Route path="about" element={<About />} />
      </Routes>
    </div>
  );
}

export function TimetableWrapper({
  violationsPerProgram,
  dataLoaded,
  userLevel,
  permissionsLoaded,
  printView = false,
}) {
  const { table } = useSelector((state) => state.auth);
  const { data: timetableData, isSuccess: settingsLoaded } =
    useGetTimetableQuery(table);
  const TimetableComponent =
    timetableData?.layoutVersion === "v1" ? Timetable : TimetableV2;

  if (!settingsLoaded || !permissionsLoaded || !dataLoaded) {
    return (
      <Container fluid>
        <Alert variant="primary">
          <i className="fa fa-spinner fa-pulse" />
          &nbsp; Načítání&hellip;
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {userLevel >= level.VIEW && (
        <TimetableComponent
          violations={violationsPerProgram}
          printView={printView}
        />
      )}
      {userLevel === level.NONE && (
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
