import React from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const rules = this.props.rules;

    return (
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Pravidlo</th>
            <th><Button variant="success"><i className="fa fa-plus"></i> Přidat</Button></th>
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
                <Button variant="outline-danger">
                  <i className="fa fa-times"></i> Smazat
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    );
  }

  formatRule(rule) {
    if (!this.props.programs[rule.program])
      return;

    const prog_title = this.props.programs[rule.program].title;

    switch (rule.condition) {
      case "is_before_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout před
          <mark>{this.formatDate(new Date(parseInt(rule.value)))}</mark></span>);
      case "is_after_date":
        return (<span><mark>{prog_title}</mark> musí proběhnout po
          <mark>{this.formatDate(new Date(parseInt(rule.value)))}</mark></span>);
      default:
    }

    if (!this.props.programs[rule.value])
      return;

    const prog2_title = this.props.programs[rule.value].title;

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

  formatDate(date) {
    return date.getUTCHours() + ':' + ((date.getUTCMinutes() < 10) ? '0' : '')
      + date.getUTCMinutes() + ' ' + date.getUTCDate() + '.' + (date.getUTCMonth() + 1) + '.'
      + date.getUTCFullYear();
  }
}

export default Settings;
