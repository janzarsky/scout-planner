import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import {
  formatDate,
  formatDateTime,
  formatTime,
  parseDate,
  parseTime,
} from "../helpers/DateUtils";

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    [
      "firstProgramRef",
      "conditionRef",
      "timeRef",
      "dateRef",
      "secondProgramRef",
    ].forEach((field) => (this[field] = React.createRef()));
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { condition: "is_before_program" };
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <RulesHeader />
          <tbody>
            {this.props.rules.map((rule, index) => (
              <Rule
                key={rule._id}
                cnt={index + 1}
                rule={rule}
                programs={this.props.programs}
                groups={this.props.groups}
                violation={this.props.violations.get(rule._id)}
                deleteRule={() => this.props.deleteRule(rule._id)}
              />
            ))}
            <NewRule
              programs={this.props.programs}
              groups={this.props.groups}
              condition={this.state.condition}
              setCondition={(condition) =>
                this.setState({ condition: condition })
              }
              firstProgramRef={this.firstProgramRef}
              secondProgramRef={this.secondProgramRef}
              conditionRef={this.conditionRef}
              timeRef={this.timeRef}
              dateRef={this.dateRef}
            />
          </tbody>
        </Table>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    const condition = this.conditionRef.current.value;

    var value;
    switch (condition) {
      case "is_before_date":
      case "is_after_date":
        value =
          parseDate(this.dateRef.current.value) +
          parseTime(this.timeRef.current.value);
        break;
      case "is_before_program":
      case "is_after_program":
        value = this.secondProgramRef.current.value;
        break;
      default:
        value = null;
    }

    this.props.addRule({
      program: this.firstProgramRef.current.value,
      condition: condition,
      value: value,
    });
  }
}

function RulesHeader() {
  return (
    <thead>
      <tr>
        <th>#</th>
        <th>Pravidlo</th>
        <th>Splněno</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Rule(props) {
  return (
    <tr>
      <td>{props.cnt}</td>
      <td>{formatRule(props.rule, props.programs, props.groups)}</td>
      <td>
        {props.violation &&
          (props.violation.satisfied ? (
            <span className="text-success">
              <i className="fa fa-check" /> ano
            </span>
          ) : (
            <span className="text-danger">
              <i className="fa fa-times" /> {props.violation.msg}
            </span>
          ))}
      </td>
      <td>
        <Button variant="link text-danger" onClick={props.deleteRule}>
          <i className="fa fa-trash"></i> Smazat
        </Button>
      </td>
    </tr>
  );
}

function NewRule(props) {
  return (
    <tr>
      <td></td>
      <td>
        <Form.Row>
          <Col sm="3">
            <Form.Control
              as="select"
              defaultValue="Žádný program"
              ref={props.firstProgramRef}
            >
              <option>Žádný program</option>
              {props.programs.map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {formatProgram(prog, props.groups)}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col>
            <Form.Control
              as="select"
              ref={props.conditionRef}
              onChange={(ev) => props.setCondition(ev.target.value)}
            >
              <option value="is_before_date">musí proběhnout před</option>
              <option value="is_after_date">musí proběhnout po</option>
              <option value="is_before_program">
                musí proběhnout před programem
              </option>
              <option value="is_after_program">
                musí proběhnout po programu{" "}
              </option>
            </Form.Control>
          </Col>
          {(() => {
            switch (props.condition) {
              case "is_before_date":
              case "is_after_date":
                return (
                  <>
                    <Col sm="2">
                      <Form.Control
                        ref={props.timeRef}
                        defaultValue={formatTime(Date.now())}
                      />
                    </Col>
                    <Col sm="2">
                      <Form.Control
                        ref={props.dateRef}
                        defaultValue={formatDate(Date.now())}
                      />
                    </Col>
                  </>
                );
              case "is_before_program":
              case "is_after_program":
                return (
                  <Col>
                    <Form.Control
                      as="select"
                      defaultValue="Žádný program"
                      ref={props.secondProgramRef}
                    >
                      <option>Žádný program</option>
                      {props.programs.map((prog) => (
                        <option key={prog._id} value={prog._id}>
                          {formatProgram(prog, props.groups)}
                        </option>
                      ))}
                    </Form.Control>
                  </Col>
                );
              default:
                return null;
            }
          })()}
        </Form.Row>
      </td>
      <td></td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus"></i> Přidat
        </Button>
      </td>
    </tr>
  );
}

function formatRule(rule, programs, groups) {
  const prog_title = formatProgram(
    programs.find((program) => program._id === rule.program),
    groups
  );

  switch (rule.condition) {
    case "is_before_date":
      return (
        <span>
          <mark>{prog_title}</mark> musí proběhnout před
          <mark>{formatDateTime(rule.value)}</mark>
        </span>
      );
    case "is_after_date":
      return (
        <span>
          <mark>{prog_title}</mark> musí proběhnout po
          <mark>{formatDateTime(rule.value)}</mark>
        </span>
      );
    default:
  }

  var prog2_title = formatProgram(
    programs.find((program) => program._id === rule.program),
    groups
  );

  switch (rule.condition) {
    case "is_before_program":
      return (
        <span>
          <mark>{prog_title}</mark> musí proběhnout před
          <mark>{prog2_title}</mark>
        </span>
      );
    case "is_after_program":
      return (
        <span>
          <mark>{prog_title}</mark> musí proběhnout po
          <mark>{prog2_title}</mark>
        </span>
      );
    default:
      return;
  }
}

function formatProgram(prog, groups) {
  const groupNames = prog.groups
    ? prog.groups
        .map((groupId) => {
          const found = groups.find((group) => group._id === groupId);
          if (found) return found.name;
        })
        .join(", ")
    : "";

  if (prog) {
    return `${prog.title === "" ? "(bez názvu)" : prog.title} (${formatDateTime(
      prog.begin
    )}) ${
      prog.groups.length > 0 && prog.groups.length < groups.length
        ? ` (skupiny: ${groupNames})`
        : " (všechny skupiny)"
    }`;
  }

  return "(program nenalezen)";
}
