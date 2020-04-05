import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import DateUtils from './DateUtils.js'

class Settings extends React.Component {
  constructor(props) {
    super(props);
    ['program', 'condition', 'value'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      condition: 'is_before_date',
    };
  }

  render() {
    const rules = this.props.rules;
    var cnt = 0;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Pravidlo</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(rules).map((key) =>
              <tr key={key}>
                <td>
                  {cnt += 1}
                </td>
                <td>
                  {this.formatRule(rules[key])}
                </td>
                <td>
                  <Button
                    variant="outline-danger"
                    onClick={() => {
                      this.props.deleteRule(rules[key]._id);
                    }}>
                    <i className="fa fa-times"></i> Smazat
                  </Button>
                </td>
              </tr>
            )}
            <tr key="new_rule">
              <td></td>
              <td>
                <Form.Row>
                  <Col>
                    <Form.Control as="select" defaultValue="Žádný program" ref={this.program}>
                      <option>Žádný program</option>
                      {Object.keys(this.props.programs).map((key) =>
                        <option key={key} value={key}>{this.props.programs[key].title}</option>
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
                  <Col>
                    {(() => {
                      switch (this.state.condition) {
                        case 'is_before_date':
                        case 'is_after_date':
                          return (
                            <Form.Control
                              ref={this.value}
                              defaultValue={DateUtils.formatDate(Date.now())}
                            />
                          );
                        case 'is_before_program':
                        case 'is_after_program':
                          return (
                            <Form.Control as="select" defaultValue="Žádný program" ref={this.value}>
                              <option>Žádný program</option>
                              {Object.keys(this.props.programs).map((key) =>
                                <option key={key} value={key}>{this.props.programs[key].title}</option>
                              )}
                            </Form.Control>
                          );
                        default:
                          return null;
                      }
                    })()}
                  </Col>
                </Form.Row>
              </td>
              <td>
                <Button variant="success" type="submit">
                  <i className="fa fa-plus"></i> Přidat
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Form>
    );
  }

  formatRule(rule) {
    var prog_title = (this.props.programs[rule.program])
      ? this.props.programs[rule.program].title : '(program nenalezen)';

    if (prog_title === '')
      prog_title = '(bez názvu)';

    switch (rule.condition) {
      case "is_before_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout před
          <mark>{DateUtils.formatDate(rule.value)}</mark></span>);
      case "is_after_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout po
          <mark>{DateUtils.formatDate(rule.value)}</mark></span>);
      default:
    }

    var prog2_title = (this.props.programs[rule.value])
      ? this.props.programs[rule.value].title : '(program nenalezen)';

    if (prog2_title === '')
      prog2_title = '(bez názvu)';

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

  parseDate(str) {
    // TODO create universal date and time parsers

    return Date.now();
  }

  handleSubmit(event) {
    event.preventDefault();

    const condition = this.condition.current.value;

    var value = this.value.current.value;

    if (condition === 'is_before_date' || condition === 'is_after_date')
      value = this.parseDate(value);

    this.props.addRule({
      program: this.program.current.value,
      condition: condition,
      value: value,
    });
  }
}

export default Settings;
