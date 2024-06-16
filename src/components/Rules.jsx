import React from "react";
import { useMemo, useState } from "react";
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
import { useSelector } from "react-redux";
import { addRule, deleteRule } from "../store/rulesSlice";
import { firestoreClientFactory } from "../FirestoreClient";
import Row from "react-bootstrap/esm/Row";
import { useCommandHandler } from "./CommandContext";
import { useGetGroupsSlice } from "../store/groupsSlice";

export default function Rules({ violations }) {
  const [firstProgram, setFirstProgram] = useState("Žádný program");
  const [condition, setCondition] = useState("is_before_program");
  const [time, setTime] = useState(formatTime(Date.now()));
  const [date, setDate] = useState(formatDate(Date.now()));
  const [secondProgram, setSecondProgram] = useState("Žádný program");

  const { table, userLevel } = useSelector((state) => state.auth);

  const { rules } = useSelector((state) => state.rules);
  const { programs } = useSelector((state) => state.programs);
  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsSlice(
    table,
    false,
  );
  const { dispatchCommand } = useCommandHandler();

  const client = firestoreClientFactory.getClient(table);

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

    const newRule = {
      program: firstProgram,
      condition: condition,
      value: value,
    };
    dispatchCommand(client, addRule(newRule));
  }

  const rulesData = useMemo(
    () =>
      [...rules]
        .sort((a, b) => ruleSort(a, b, programs))
        .map((rule) => ({
          ...rule,
          formatted: formatRule(rule, programs, groupsLoaded ? groups : []),
        })),
    [rules, programs, groups],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <RulesHeader />
        <tbody>
          {rulesData.map((rule, index) => (
            <Rule
              key={rule._id}
              cnt={index + 1}
              rule={rule}
              formattedRule={rule.formatted}
              violation={violations.get(rule._id)}
              deleteRule={() => dispatchCommand(client, deleteRule(rule._id))}
            />
          ))}
          {userLevel >= level.EDIT && (
            <NewRule
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

function RulesHeader() {
  const userLevel = useSelector((state) => state.auth.userLevel);

  return (
    <thead>
      <tr>
        <th>#</th>
        <th>Pravidlo</th>
        <th>Splněno</th>
        {userLevel >= level.EDIT && <th>Akce</th>}
      </tr>
    </thead>
  );
}

function Rule({ cnt, violation, formattedRule, deleteRule }) {
  const userLevel = useSelector((state) => state.auth.userLevel);

  return (
    <tr>
      <td>{cnt}</td>
      <td>{formattedRule}</td>
      <td>
        {violation &&
          (violation.satisfied ? (
            <span className="text-success">
              <i className="fa fa-check" /> ano
            </span>
          ) : (
            <span className="text-danger">
              <i className="fa fa-times" /> {violation.msg}
            </span>
          ))}
      </td>
      {userLevel >= level.EDIT && (
        <td>
          <Button variant="link text-danger" onClick={deleteRule}>
            <i className="fa fa-trash"></i> Smazat
          </Button>
        </td>
      )}
    </tr>
  );
}

function NewRule({
  firstProgram,
  setFirstProgram,
  condition,
  setCondition,
  secondProgram,
  setSecondProgram,
  time,
  setTime,
  date,
  setDate,
}) {
  const { table } = useSelector((state) => state.auth);
  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsSlice(
    table,
    false,
  );
  const programs = useSelector((state) => state.programs.programs);

  const formattedPrograms = useMemo(
    () =>
      [...programs]
        .sort(programSort)
        .map((prog) => ({
          _id: prog._id,
          text: formatProgram(prog, groupsLoaded ? groups : []),
        })),
    [programs, groups],
  );

  return (
    <tr>
      <td></td>
      <td>
        <Row>
          <Col sm="3">
            <Form.Select
              value={firstProgram}
              onChange={(e) => setFirstProgram(e.target.value)}
            >
              <option>Žádný program</option>
              {formattedPrograms.map((prog) => (
                <option key={prog._id} value={prog._id}>
                  {prog.text}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col>
            <Form.Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="is_before_date">musí proběhnout před</option>
              <option value="is_after_date">musí proběhnout po</option>
              <option value="is_before_program">
                musí proběhnout před programem
              </option>
              <option value="is_after_program">
                musí proběhnout po programu{" "}
              </option>
            </Form.Select>
          </Col>
          {(() => {
            switch (condition) {
              case "is_before_date":
              case "is_after_date":
                return (
                  <>
                    <Col sm="2">
                      <Form.Control
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </Col>
                    <Col sm="2">
                      <Form.Control
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </Col>
                  </>
                );
              case "is_before_program":
              case "is_after_program":
                return (
                  <Col>
                    <Form.Select
                      value={secondProgram}
                      onChange={(e) => setSecondProgram(e.target.value)}
                    >
                      <option>Žádný program</option>
                      {formattedPrograms.map((prog) => (
                        <option key={prog._id} value={prog._id}>
                          {prog.text}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                );
              default:
                return null;
            }
          })()}
        </Row>
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
    groups,
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
    groups,
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
      prog.begin,
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
