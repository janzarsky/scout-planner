/**
 * @file Table of rules
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import DateUtils from './DateUtils'

class Settings extends React.Component {
  constructor(props) {
    super(props);
    ['program', 'condition', 'time', 'date', 'program2'].forEach((field) =>
      this[field] = React.createRef()
    );
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { condition: 'is_before_date' };
  }

  render() {
    const rules = this.props.rules;
    const violations = this.props.violations;
    var cnt = 0;

    return <Form onSubmit={this.handleSubmit}>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Pravidlo</th>
            <th>Splněno</th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {[...rules.entries()].map(([key, rule]) =>
            <tr key={key}>
              <td>
                {cnt += 1}
              </td>
              <td>
                {this.formatRule(rule)}
              </td>
              <td>
                {violations.get(key) && (violations.get(key).satisfied
                  ? <span className="text-success"><i className="fa fa-check" /> ano</span>
                  : <span className="text-danger">
                      <i className="fa fa-times" /> {violations.get(key).msg}
                    </span>
                )}
              </td>
              <td>
                <Button
                  variant="link text-danger"
                  onClick={() => {
                    this.props.deleteRule(rule._id);
                  }}>
                  <i className="fa fa-trash"></i> Smazat
                </Button>
              </td>
            </tr>
          )}
          <tr key="new_rule">
            <td></td>
            <td>
              <Form.Row>
                <Col sm="3">
                  <Form.Control as="select" defaultValue="Žádný program" ref={this.program}>
                    <option>Žádný program</option>
                    {[...this.props.programs.entries()].map(([key, prog]) =>
                      <option key={key} value={key}>{this.formatProgram(prog)}</option>
                    )}
                  </Form.Control>
                </Col>
                <Col>
                  <Form.Control as="select" ref={this.condition}
                    onChange={(ev) => this.setState({ condition: ev.target.value })}>
                    <option value="is_before_date">musí proběhnout před</option>
                    <option value="is_after_date">musí proběhnout po</option>
                    <option value="is_before_program">musí proběhnout před programem</option>
                    <option value="is_after_program">musí proběhnout po programu </option>
                  </Form.Control>
                </Col>
                {(() => {
                  switch (this.state.condition) {
                    case 'is_before_date':
                    case 'is_after_date':
                      return (<>
                        <Col sm="2">
                          <Form.Control ref={this.time}
                            defaultValue={DateUtils.formatTime(Date.now())}
                          />
                        </Col>
                        <Col sm="2">
                          <Form.Control ref={this.date}
                            defaultValue={DateUtils.formatDate(Date.now())}
                          />
                        </Col>
                      </>);
                    case 'is_before_program':
                    case 'is_after_program':
                      return (
                        <Col>
                          <Form.Control as="select" defaultValue="Žádný program" ref={this.program2}>
                            <option>Žádný program</option>
                            {[...this.props.programs.entries()].map(([key, prog]) =>
                            <option key={key} value={key}>{this.formatProgram(prog)}</option>
                            )}
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
        </tbody>
      </Table>
    </Form>;
  }

  formatRule(rule) {
    const prog_title = this.formatProgram(this.props.programs.get(rule.program));

    switch (rule.condition) {
      case "is_before_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout před
          <mark>{DateUtils.formatDateTime(rule.value)}</mark></span>);
      case "is_after_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout po
          <mark>{DateUtils.formatDateTime(rule.value)}</mark></span>);
      default:
    }

    var prog2_title = this.formatProgram(this.props.programs.get(rule.value));

    switch (rule.condition) {
      case "is_before_program":
        return (<span><mark>{prog_title}</mark> musí proběhnout před
          <mark>{prog2_title}</mark></span>);
      case "is_after_program":
        return (<span><mark>{prog_title}</mark> musí proběhnout po
          <mark>{prog2_title}</mark></span>);
      default:
        return;
    }
  }

  formatProgram(prog) {
    if (prog) {
      return `${(prog.title === '') ? '(bez názvu)' : prog.title} (${DateUtils.formatDateTime(prog.begin)}) ${(prog.groups.length > 0) ? ` (skupiny: ${prog.groups.join(', ')})` : ' (všechny skupiny)'}`;
    }

    return '(program nenalezen)';
  }

  handleSubmit(event) {
    event.preventDefault();

    const condition = this.condition.current.value;

    var value;
    switch (condition) {
      case 'is_before_date':
      case 'is_after_date':
        value = DateUtils.parseDate(this.date.current.value)
          + DateUtils.parseTime(this.time.current.value);
        break;
      case 'is_before_program':
      case 'is_after_program':
        value = this.program2.current.value;
        break;
      default:
        value = null;
    }

    this.props.addRule({
      program: this.program.current.value,
      condition: condition,
      value: value,
    });
  }
}

export default Settings;
