import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Data from "./Client";

export default class ImportExport extends React.Component {
  constructor(props) {
    super(props);
    ["importData"].forEach((field) => (this[field] = React.createRef()));
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const data = JSON.stringify({
      programs: this.props.programs,
      pkgs: this.props.pkgs,
      groups: this.props.groups,
      rules: this.props.rules,
      ranges: this.props.ranges,
    });

    return (
      <Form onSubmit={this.handleSubmit}>
        <Container fluid>
          <Form.Group>
            <Form.Label>Exportovaná data:</Form.Label>
            <Form.Control as="textarea" value={data} readOnly />
          </Form.Group>
          <Form.Group>
            <Form.Label>Data k importu:</Form.Label>
            <Form.Control as="textarea" ref={this.importData} />
          </Form.Group>
          <Form.Group>
            <Button type="submit">Importovat</Button>
          </Form.Group>
        </Container>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const data = JSON.parse(this.importData.current.value);

    Promise.all([
      // add all packages
      Promise.all([
        ...data.pkgs.map((pkg) =>
          Data.addPackage(this.props.table, { ...pkg, _id: undefined }).then(
            // create package ID replacement map
            (newPkg) => [pkg._id, newPkg._id]
          )
        ),
      ]).then((pkgs) => new Map(pkgs)),
      // add all groups
      Promise.all([
        ...data.groups.map((group) =>
          Data.addGroup(this.props.table, { ...group, _id: undefined }).then(
            // create group ID replacement map
            (newGroup) => [group._id, newGroup._id]
          )
        ),
      ]).then((groups) => new Map(groups)),
    ])
      // replace package IDs and group IDs in programs
      .then(([pkgs, groups]) =>
        data.programs.map((prog) => {
          return {
            ...prog,
            pkg: pkgs.get(prog.pkg),
            groups: prog.groups.map((oldGroup) => groups.get(oldGroup)),
          };
        })
      )
      // add all programs
      .then((programs) =>
        Promise.all(
          programs.map((prog) =>
            Data.addProgram(this.props.table, { ...prog, _id: undefined }).then(
              // create program ID replacement map
              (newProg) => [prog._id, newProg._id]
            )
          )
        )
      )
      .then((programs) => new Map(programs))
      // replace program IDs in rules
      .then((programs) =>
        data.rules.map((rule) => {
          var value = rule.value;
          if (
            rule.condition === "is_before_program" ||
            rule.condition === "is_after_program"
          )
            value = programs.get(rule.value);
          return {
            ...rule,
            program: programs.get(rule.program),
            value: value,
          };
        })
      )
      // add all rules
      .then((rules) =>
        Promise.all(
          rules.map((rule) =>
            Data.addRule(this.props.table, { ...rule, _id: undefined })
          )
        )
      )
      .then(() => window.location.reload());
  }
}
