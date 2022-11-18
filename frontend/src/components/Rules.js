import { useState } from "react";
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
import { level } from "../helpers/Level";

export default function Settings(props) {
  const [firstProgram, setFirstProgram] = useState("Žádný program");
  const [condition, setCondition] = useState("is_before_program");
  const [time, setTime] = useState(formatTime(Date.now()));
  const [date, setDate] = useState(formatDate(Date.now()));
  const [secondProgram, setSecondProgram] = useState("Žádný program");

  function handleSubmit(event) {
    event.preventDefault();

    var value;
    switch (condition) {
      case "is_before_date":
      case "is_after_date":
        value = parseDate(date) + parseTime(time);
        break;
      case "is_before_program":
      case "is_after_program":
        value = secondProgram;
        break;
      default:
        value = null;
    }

    props.addRule({
      program: firstProgram,
      condition: condition,
      value: value,
    });
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <RulesHeader userLevel={props.userLevel} />
        <tbody>
          {[...props.rules]
            .sort((a, b) => ruleSort(a, b, props.programs))
            .map((rule, index) => (
              <Rule
                key={rule._id}
                cnt={index + 1}
                rule={rule}
                programs={props.programs}
                groups={props.groups}
                violation={props.violations.get(rule._id)}
                deleteRule={() => props.deleteRule(rule._id)}
                userLevel={props.userLevel}
              />
            ))}
          {props.userLevel >= level.EDIT && (
            <NewRule
              programs={props.programs}
              groups={props.groups}
              condition={condition}
              setCondition={setCondition}
              firstProgram={firstProgram}
              setFirstProgram={setFirstProgram}
              secondProgram={secondProgram}
              setSecondProgram={setSecondProgram}
              time={time}
              setTime={setTime}
              date={date}
              setDate={setDate}
            />
          )}
        </tbody>
      </Table>
    </Form>
  );
}

function ruleSort(a, b, programs) {
  const progA = programs.find((program) => program._id === a.program);
  const progB = programs.find((program) => program._id === b.program);

  if (progA && progB) return programSort(progA, progB);

  return 0;
}

function RulesHeader(props) {
  return (
    <thead>
      <tr>
        <th>#</th>
        <th>Pravidlo</th>
        <th>Splněno</th>
        {props.userLevel >= level.EDIT && <th>Akce</th>}
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
      {props.userLevel >= level.EDIT && (
        <td>
          <Button variant="link text-danger" onClick={props.deleteRule}>
            <i className="fa fa-trash"></i> Smazat
          </Button>
        </td>
      )}
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
              value={props.firstProgram}
              onChange={(e) => props.setFirstProgram(e.target.value)}
            >
              <option>Žádný program</option>
              {[...props.programs].sort(programSort).map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {formatProgram(prog, props.groups)}
                </option>
              ))}
            </Form.Control>
          </Col>
          <Col>
            <Form.Control
              as="select"
              value={props.condition}
              onChange={(e) => props.setCondition(e.target.value)}
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
                        value={props.time}
                        onChange={(e) => props.setTime(e.target.value)}
                      />
                    </Col>
                    <Col sm="2">
                      <Form.Control
                        value={props.date}
                        onChange={(e) => props.setDate(e.target.value)}
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
                      value={props.secondProgram}
                      onChange={(e) => props.setSecondProgram(e.target.value)}
                    >
                      <option>Žádný program</option>
                      {[...props.programs].sort(programSort).map((prog) => (
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

function programSort(a, b) {
  const titleCmp = a.title.localeCompare(b.title);
  if (titleCmp !== 0) return titleCmp;

  if (a.begin < b.begin) return -1;
  else if (a.begin > b.begin) return 1;
  else return 0;
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
    programs.find((program) => program._id === rule.value),
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
  const groupNames =
    prog && prog.groups && groups
      ? prog.groups
          .map((groupId) => {
            const found = groups.find((group) => group._id === groupId);
            return found ? found.name : "";
          })
          .join(", ")
      : "";

  if (prog) {
    return `${prog.title === "" ? "(bez názvu)" : prog.title} (${formatDateTime(
      prog.begin
    )}) ${
      prog.groups &&
      prog.groups.length > 0 &&
      groups &&
      prog.groups.length < groups.length
        ? ` (skupiny: ${groupNames})`
        : " (všechny skupiny)"
    }`;
  }

  return "(program nenalezen)";
}
