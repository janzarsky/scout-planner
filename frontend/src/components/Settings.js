import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { level } from "../helpers/Level";
import Import from "./Import";
import Export from "./Export";
import { formatDurationInMinutes } from "../helpers/DateUtils";
import { useDispatch, useSelector } from "react-redux";
import { updateSettings } from "../store/settingsSlice";
import Client from "../Client";

export default function Settings({ userLevel, handleError }) {
  const { groups } = useSelector((state) => state.groups);
  const { ranges } = useSelector((state) => state.ranges);
  const { packages } = useSelector((state) => state.packages);
  const { rules } = useSelector((state) => state.rules);
  const { users } = useSelector((state) => state.users);
  const { programs, deletedPrograms } = useSelector((state) => state.programs);

  const { token, table } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  async function deleteAll() {
    await Promise.all([
      ...programs.map((it) => client.deleteProgram(it._id)),
      ...deletedPrograms.map((it) => client.deleteProgram(it._id)),
      ...packages.map((it) => client.deletePackage(it._id)),
      ...groups.map((it) => client.deleteGroup(it._id)),
      ...rules.map((it) => client.deleteRule(it._id)),
      ...ranges.map((it) => client.deleteRange(it._id)),
      ...users.map((it) => client.deleteUser(it._id)),
    ]).then(() => window.location.reload());
  }

  return (
    <>
      <Container fluid>
        <Export />
        {userLevel >= level.ADMIN && <Import />}
        {userLevel >= level.ADMIN && (
          <Form.Group>
            <Button onClick={deleteAll}>Smazat vše</Button>
          </Form.Group>
        )}
        {userLevel >= level.EDIT && <TimeStep handleError={handleError} />}
      </Container>
    </>
  );
}

function TimeStep({ handleError }) {
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const { token, table } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  const [step, setStep] = useState(settings.timeStep);
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      const data = { ...settings, timeStep: step };
      client
        .updateSettings(data)
        .then(() => dispatch(updateSettings(data)), handleError);
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Row>
        <Form.Label column sm="2">
          Základní interval
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Control
              as="select"
              value={step}
              onChange={(e) => setStep(e.target.value)}
            >
              <option value={15 * 60 * 1000}>15 min</option>
              <option value={10 * 60 * 1000}>10 min</option>
              <option value={5 * 60 * 1000}>5 min</option>
            </Form.Control>
          ) : (
            formatDurationInMinutes(settings.timeStep)
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
      </Form.Row>
    </Form>
  );
}
