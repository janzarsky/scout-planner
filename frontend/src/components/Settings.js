import { useEffect, useState } from "react";
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

export default function Settings(props) {
  const { groups } = useSelector((state) => state.groups);
  const { ranges } = useSelector((state) => state.ranges);
  const { packages } = useSelector((state) => state.packages);
  const { rules } = useSelector((state) => state.rules);

  async function deleteAll() {
    await Promise.all([
      ...props.programs.map((it) => props.client.deleteProgram(it._id)),
      ...packages.map((it) => props.client.deletePackage(it._id)),
      ...groups.map((it) => props.client.deleteGroup(it._id)),
      ...rules.map((it) => props.client.deleteRule(it._id)),
      ...ranges.map((it) => props.client.deleteRange(it._id)),
      ...props.users.map((it) => props.client.deleteUser(it._id)),
    ]).then(() => window.location.reload());
  }

  return (
    <>
      <Container fluid>
        <Export programs={props.programs} users={props.users} />
        {props.userLevel >= level.ADMIN && <Import client={props.client} />}
        {props.userLevel >= level.ADMIN && (
          <Form.Group>
            <Button onClick={deleteAll}>Smazat vše</Button>
          </Form.Group>
        )}
        {props.userLevel >= level.EDIT && (
          <TimeStep client={props.client} handleError={props.handleError} />
        )}
      </Container>
    </>
  );
}

function TimeStep({ client, handleError }) {
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

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
