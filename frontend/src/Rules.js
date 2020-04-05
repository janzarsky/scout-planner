import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    ['program', 'condition', 'value'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const rules = this.props.rules;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Pravidlo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(rules).map((key) =>
              <tr key={key}>
                <td>
                  {this.formatRule(rules[key])}
                </td>
                <td>
                  <Button variant="outline-primary">
                    <i className="fa fa-pencil"></i> Upravit
                  </Button>&nbsp;
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
                    <Form.Control as="select" ref={this.condition}>
                      <option value="is_before_date">musí proběhnout před</option>
                      <option value="is_after_date">musí proběhnout po</option>
                      <option value="is_before_program">musí proběhnout před programem</option>
                      <option value="is_after_program">musí proběhnout po programu </option>
                    </Form.Control>
                  </Col>
                  <Col>
                    <Form.Control ref={this.value} defaultValue="asdf" />
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
    const prog_title = (this.props.programs[rule.program])
      ? this.props.programs[rule.program].title : '(program nenalezen)';

    switch (rule.condition) {
      case "is_before_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout před
          <mark>{this.formatDate(rule.value)}</mark></span>);
      case "is_after_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout po
          <mark>{this.formatDate(rule.value)}</mark></span>);
      default:
    }

    const prog2_title = (this.props.programs[rule.value])
      ? this.props.programs[rule.value].title : '(program nenalezen)';

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

  formatDate(ms) {
    const date = new Date(parseInt(ms));

    if (isNaN(date.getTime()))
      return '(chybné datum)';

    return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '')
      + date.getUTCMinutes() + ' ' + date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.'
      + date.getUTCFullYear();
  }

  handleSubmit(event) {
    event.preventDefault();

    this.props.addRule({
      program: this.program.current.value,
      condition: this.condition.current.value,
      value: this.value.current.value,
    });
  }
}

export default Settings;
