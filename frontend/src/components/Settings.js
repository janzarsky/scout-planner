import React from "react";
import Button from "react-bootstrap/Button";
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
            <Button onClick={this.deleteAll}>Smazat vše</Button>
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
