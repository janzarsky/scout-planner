import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { level } from "../helpers/Level";
import Import from "./Import";
import Export from "./Export";

export default function Settings(props) {
  async function deleteAll() {
    await Promise.all([
      ...props.programs.map((it) => props.client.deleteProgram(it._id)),
      ...props.pkgs.map((it) => props.client.deletePackage(it._id)),
      ...props.groups.map((it) => props.client.deleteGroup(it._id)),
      ...props.rules.map((it) => props.client.deleteRule(it._id)),
      ...props.ranges.map((it) => props.client.deleteRange(it._id)),
      ...props.users.map((it) => props.client.deleteUser(it._id)),
    ]).then(() => window.location.reload());
  }

  return (
    <>
      <Container fluid>
        <Export
          programs={props.programs}
          pkgs={props.pkgs}
          groups={props.groups}
          rules={props.rules}
          ranges={props.ranges}
          users={props.users}
        />
        {props.userLevel >= level.ADMIN && (
          <Import
            programs={props.programs}
            pkgs={props.pkgs}
            groups={props.groups}
            rules={props.rules}
            ranges={props.ranges}
            users={props.users}
            client={props.client}
          />
        )}
        {props.userLevel >= level.ADMIN && (
          <Form.Group>
            <Button onClick={deleteAll}>Smazat vše</Button>
          </Form.Group>
        )}
        {props.userLevel >= level.EDIT && (
          <TimeStep
            timeStep={props.timeStep}
            updateTimeStep={props.updateTimeStep}
          />
        )}
      </Container>
    </>
  );
}

function TimeStep(props) {
  const [timeStep, setTimeStep] = useState(props.timeStep);

  function handleSubmit(event) {
    event.preventDefault();
    props.updateTimeStep(timeStep);
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Row>
        <Form.Label column sm="2">
          Základní interval
        </Form.Label>
        <Col sm="3">
          <Form.Control
            as="select"
            value={timeStep}
            onChange={(e) => setTimeStep(e.target.value)}
          >
            <option value={15 * 60 * 1000}>15 min</option>
            <option value={10 * 60 * 1000}>10 min</option>
            <option value={5 * 60 * 1000}>5 min</option>
          </Form.Control>
        </Col>
        <Col>
          <Button type="submit">
            <i className="fa fa-check"></i> Uložit
          </Button>
        </Col>
      </Form.Row>
    </Form>
  );
}
