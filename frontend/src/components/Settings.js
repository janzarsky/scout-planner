import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { level } from "../helpers/Level";
import Import from "./Import";
import Export from "./Export";

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.deleteAll = this.deleteAll.bind(this);
  }

  render() {
    return (
      <>
        <Container fluid>
          <Export
            programs={this.props.programs}
            pkgs={this.props.pkgs}
            groups={this.props.groups}
            rules={this.props.rules}
            ranges={this.props.ranges}
            users={this.props.users}
          />
          {this.props.userLevel >= level.ADMIN && (
            <Import
              programs={this.props.programs}
              pkgs={this.props.pkgs}
              groups={this.props.groups}
              rules={this.props.rules}
              ranges={this.props.ranges}
              users={this.props.users}
              client={this.props.client}
            />
          )}
          {this.props.userLevel >= level.ADMIN && (
            <Form.Group>
              <Button onClick={this.deleteAll}>Smazat vše</Button>
            </Form.Group>
          )}
          {this.props.userLevel >= level.EDIT && (
            <TimeStep
              timeStep={this.props.timeStep}
              updateTimeStep={this.props.updateTimeStep}
            />
          )}
        </Container>
      </>
    );
  }

  async deleteAll() {
    await Promise.all([
      ...this.props.programs.map((it) =>
        this.props.client.deleteProgram(it._id)
      ),
      ...this.props.pkgs.map((it) => this.props.client.deletePackage(it._id)),
      ...this.props.groups.map((it) => this.props.client.deleteGroup(it._id)),
      ...this.props.rules.map((it) => this.props.client.deleteRule(it._id)),
      ...this.props.ranges.map((it) => this.props.client.deleteRange(it._id)),
      ...this.props.users.map((it) => this.props.client.deleteUser(it._id)),
    ]).then(() => window.location.reload());
  }
}

class TimeStep extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.timeStepRef = React.createRef();
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Row>
          <Form.Label column sm="2">
            Základní interval
          </Form.Label>
          <Col sm="3">
            <Form.Control
              as="select"
              defaultValue={this.props.timeStep}
              ref={this.timeStepRef}
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

  handleSubmit(event) {
    event.preventDefault();
    this.props.updateTimeStep(this.timeStepRef.current.value);
  }
}
