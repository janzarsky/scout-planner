import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { level } from "../helpers/Level";
import Import from "./Import";
import Export from "./Export";
import { formatDurationInMinutes } from "../helpers/DateUtils";
import { useSelector } from "react-redux";
import { updateSettings } from "../store/settingsSlice";
import { firestoreClientFactory } from "../FirestoreClient";
import Row from "react-bootstrap/esm/Row";
import { TimetableTitle } from "./TimetableTitle";
import { useCommandHandler } from "./CommandContext";
import { useGetRangesQuery } from "../store/rangesApi";
import { useGetRangesSlice } from "../store/rangesSlice";
import { useGetPackagesSlice } from "../store/packagesSlice";
import { useGetGroupsSlice } from "../store/groupsSlice";
import { useGetPeopleSlice } from "../store/peopleSlice";
import { useGetRulesSlice } from "../store/rulesSlice";

export default function Settings() {
  const userLevel = useSelector((state) => state.auth.userLevel);
  const timetableTitle = useSelector((state) => state.config.timetableTitle);

  return (
    <>
      <Container fluid>
        <h2 className="mt-3">Nastavení</h2>
        {userLevel >= level.EDIT && timetableTitle && <TimetableTitle />}
        {userLevel >= level.EDIT && <TimeStep />}
        {userLevel >= level.EDIT && <Width />}
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
  const rtkQuery = useSelector((state) => state.config.rtkQuery);

  const { data: groups } = useGetGroupsSlice(table, false);
  const { data: oldRanges } = useGetRangesSlice(table, rtkQuery);
  const { data: newRanges } = useGetRangesQuery(table, rtkQuery);
  const ranges = rtkQuery ? newRanges : oldRanges;
  const { data: packages } = useGetPackagesSlice(table, false);
  const { data: rules } = useGetRulesSlice(table, false);
  const { users } = useSelector((state) => state.users);
  const { data: people } = useGetPeopleSlice(table, false);
  const { programs, deletedPrograms } = useSelector((state) => state.programs);

  const client = firestoreClientFactory.getClient(table);

  async function deleteAll() {
    await client.setPublicLevel(level.ADMIN);

    await Promise.all([
      ...programs.map((it) => client.deleteProgram(it._id)),
      ...deletedPrograms.map((it) => client.deleteProgram(it._id)),
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
  const { settings } = useSelector((state) => state.settings);
  const { dispatchCommand } = useCommandHandler();

  const { table } = useSelector((state) => state.auth);
  const client = firestoreClientFactory.getClient(table);

  const [step, setStep] = useState(settings.timeStep);
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      dispatchCommand(client, updateSettings({ ...settings, timeStep: step }));
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
              {formatDurationInMinutes(settings.timeStep)}
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
  const { settings } = useSelector((state) => state.settings);
  const { dispatchCommand } = useCommandHandler();

  const { table } = useSelector((state) => state.auth);
  const client = firestoreClientFactory.getClient(table);

  const [width, setWidth] = useState(settings.width);
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      dispatchCommand(
        client,
        updateSettings({ ...settings, width: parseInt(width) }),
      );
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
                  settings.width
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
