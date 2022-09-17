import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import { level } from "../helpers/Level";
import Import from "./Import";

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.deleteAll = this.deleteAll.bind(this);
  }

  render() {
    const data = JSON.stringify({
      programs: this.props.programs,
      pkgs: this.props.pkgs,
      groups: this.props.groups,
      rules: this.props.rules,
      ranges: this.props.ranges,
      users: this.props.users,
    });

    return (
      <>
        <Container fluid>
          <Form.Group>
            <Form.Label>Exportovaná data:</Form.Label>
            <Form.Control as="textarea" value={data} readOnly />
          </Form.Group>
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
        </Container>
        {this.props.userLevel >= level.ADMIN && (
          <Container fluid>
            <Button onClick={this.deleteAll}>Smazat vše</Button>
          </Container>
        )}
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
