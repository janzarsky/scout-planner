import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { level } from "@scout-planner/common/level";
import Import from "./Import";
import Export from "./Export";
import { formatDurationInMinutes } from "../helpers/DateUtils";
import { useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";
import Row from "react-bootstrap/esm/Row";
import { TimetableTitle } from "./TimetableTitle";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetGroupsQuery } from "../store/groupsApi";
import { useGetPackagesQuery } from "../store/packagesApi";
import { useGetPeopleQuery } from "../store/peopleApi";
import { useGetRulesQuery } from "../store/rulesApi";
import { useGetUsersQuery } from "../store/usersApi";
import {
  DEFAULT_TIME_STEP,
  DEFAULT_WIDTH,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "../store/settingsApi";
import { useGetProgramsQuery } from "../store/programsApi";
import {
  useGetTimetableQuery,
  useUpdateLayoutVersionMutation,
} from "../store/timetableApi";
import { useConfig } from "../store/configSlice";
import Clone from "./Clone";
import Shift from "./Shift";

export default function Settings() {
  const timetableLayoutVersionSwitchingEnabled = useConfig(
    "timetableLayoutVersionSwitchingEnabled",
  );
  const cloneFeature = useConfig("cloneFeature");
  const shiftFeature = useConfig("shiftFeature");
  const userLevel = useSelector((state) => state.auth.userLevel);
  const { table } = useSelector((state) => state.auth);
  const { data: timetableData, isSuccess: layoutVersionLoaded } =
    useGetTimetableQuery(table);
  const layoutVersion = layoutVersionLoaded
    ? timetableData.layoutVersion
    : null;

  if (!layoutVersionLoaded) {
    return null;
  }

  return (
    <>
      <Container fluid>
        <h2 className="mt-3">Nastavení</h2>
        {userLevel >= level.EDIT && <TimetableTitle />}
        {layoutVersion === "v1" && (
          <>
            {userLevel >= level.EDIT && <TimeStep />}
            {userLevel >= level.EDIT && <Width />}
          </>
        )}
        {userLevel >= level.EDIT && timetableLayoutVersionSwitchingEnabled && (
          <TimetableLayoutVersion />
        )}
        {userLevel >= level.EDIT && <GroupLock />}
        {cloneFeature && <Clone />}
        {shiftFeature && <Shift />}
        <h2 className="mt-5 text-danger">
          <i className="fa fa-exclamation-triangle"></i> Pokročilé
        </h2>
        <Export />
        {userLevel >= level.ADMIN && <Import />}
        {userLevel >= level.ADMIN && <DeleteAll />}
      </Container>
    </>
  );
}

function DeleteAll() {
  const table = useSelector((state) => state.auth.table);

  const { data: groups } = useGetGroupsQuery(table);
  const { data: ranges } = useGetRangesQuery(table);
  const { data: packages } = useGetPackagesQuery(table);
  const { data: rules } = useGetRulesQuery(table);
  const { data: users } = useGetUsersQuery(table);
  const { data: people } = useGetPeopleQuery(table);
  const { data: programs } = useGetProgramsQuery(table);

  const client = firestoreClientFactory.getClient(table);

  async function deleteAll() {
    await client.setPublicLevel(level.ADMIN);

    await Promise.all([
      ...programs.map((it) => client.deleteProgram(it._id)),
      ...packages.map((it) => client.deletePackage(it._id)),
      ...groups.map((it) => client.deleteGroup(it._id)),
      ...rules.map((it) => client.deleteRule(it._id)),
      ...ranges.map((it) => client.deleteRange(it._id)),
      ...users.map((it) => client.deleteUser(it._id)),
      ...people.map((it) => client.deletePerson(it._id)),
      client.updateTimetable({ settings: {} }),
      client.setPublicLevel(level.ADMIN),
    ]).then(() => window.location.reload());
  }

  return (
    <Form.Group className="mb-3">
      <Button className="btn-danger" onClick={deleteAll}>
        <i className="fa fa-trash"></i> Smazat vše
      </Button>
    </Form.Group>
  );
}

function TimeStep() {
  const { table } = useSelector((state) => state.auth);
  const { data: settings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const [updateSettings] = useUpdateSettingsMutation();

  const [step, setStep] = useState(
    settingsLoaded ? settings.timeStep : DEFAULT_TIME_STEP,
  );
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      updateSettings({ table, data: { ...settings, timeStep: step } });
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label column sm="2">
          Základní interval
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Select value={step} onChange={(e) => setStep(e.target.value)}>
              <option value={15 * 60 * 1000}>15 min</option>
              <option value={10 * 60 * 1000}>10 min</option>
              <option value={5 * 60 * 1000}>5 min</option>
            </Form.Select>
          ) : (
            <Form.Label className="pt-2">
              {formatDurationInMinutes(
                settingsLoaded ? settings.timeStep : DEFAULT_TIME_STEP,
              )}
            </Form.Label>
          )}
        </Col>
        <Col>
          {editing ? (
            <Button type="submit">
              <i className="fa fa-check"></i> Uložit
            </Button>
          ) : (
            <Button type="submit">
              <i className="fa fa-pencil"></i> Upravit
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}

function Width() {
  const { table } = useSelector((state) => state.auth);
  const { data: settings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const [updateSettings] = useUpdateSettingsMutation();

  const [width, setWidth] = useState(
    settingsLoaded ? settings.width : DEFAULT_WIDTH,
  );
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      updateSettings({ table, data: { ...settings, width: parseInt(width) } });
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label column sm="2">
          Šířka harmonogramu
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Select
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            >
              <option value={25}>Nejužší</option>
              <option value={50}>Užší</option>
              <option value={100}>Normální</option>
              <option value={150}>Širší</option>
            </Form.Select>
          ) : (
            <Form.Label className="pt-2">
              {
                { 25: "Nejužší", 50: "Užší", 100: "Normální", 150: "Širší" }[
                  settingsLoaded ? settings.width : DEFAULT_WIDTH
                ]
              }
            </Form.Label>
          )}
        </Col>
        <Col>
          {editing ? (
            <Button type="submit">
              <i className="fa fa-check"></i> Uložit
            </Button>
          ) : (
            <Button type="submit">
              <i className="fa fa-pencil"></i> Upravit
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}

const timetableLayoutVersions = [
  { key: "v1", label: "Verze 1 (původní)" },
  { key: "v2", label: "Verze 2 (experimentální)" },
];

function TimetableLayoutVersion() {
  const { table } = useSelector((state) => state.auth);
  const { data, isSuccess: queryLoaded } = useGetTimetableQuery(table);
  const [updateVersion] = useUpdateLayoutVersionMutation();

  const [version, setVersion] = useState(
    queryLoaded ? data.layoutVersion : "v1",
  );
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      updateVersion({
        table,
        data: version,
      });
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label column sm="2">
          Verze rozložení harmonogramu
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              {timetableLayoutVersions.map((it) => (
                <option key={it.key} value={it.key}>
                  {it.label}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Label className="pt-2">
              {queryLoaded &&
                timetableLayoutVersions.find((it) => it.key === version)?.label}
            </Form.Label>
          )}
        </Col>
        <Col>
          {editing ? (
            <Button type="submit">
              <i className="fa fa-check"></i> Uložit
            </Button>
          ) : (
            <Button type="submit">
              <i className="fa fa-pencil"></i> Upravit
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}

function GroupLock() {
  const { table } = useSelector((state) => state.auth);
  const { data: settings, isSuccess: settingsLoaded } =
    useGetSettingsQuery(table);
  const [updateSettings] = useUpdateSettingsMutation();

  const [groupLock, setGroupLock] = useState(
    settingsLoaded ? settings.groupLock : false,
  );
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      updateSettings({
        table,
        data: { ...settings, groupLock: groupLock == "true" },
      });
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label column sm="2">
          Přesouvání programů mezi skupinami &nbsp;
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Select
              value={groupLock}
              onChange={(e) => setGroupLock(e.target.value)}
            >
              <option key={false} value={false}>
                Povoleno
              </option>
              <option key={true} value={true}>
                Zakázáno
              </option>
            </Form.Select>
          ) : (
            <Form.Label className="pt-2">
              {settingsLoaded && settings.groupLock ? "Zakázáno" : "Povoleno"}
            </Form.Label>
          )}
        </Col>
        <Col>
          {editing ? (
            <Button type="submit">
              <i className="fa fa-check"></i> Uložit
            </Button>
          ) : (
            <Button type="submit">
              <i className="fa fa-pencil"></i> Upravit
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}
