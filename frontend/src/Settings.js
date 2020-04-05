import React from 'react';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

class Settings extends React.Component {
  constructor(props) {
    super(props);
    ['name', 'color'].forEach((field) => this[field] = React.createRef());
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    const pkgs = this.props.pkgs;
    var cnt = 0;

    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Balíček</th>
              <th>Barva</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(pkgs).map((key) =>
              <tr key={key}>
                <td>{cnt += 1}</td>
                <td>{pkgs[key].name}</td>
                <td>
                  <span
                    className="color-sample"
                    style={{ backgroundColor: pkgs[key].color }}
                  >&nbsp;</span>
                  {pkgs[key].color}
                </td>
                <td>
                  <Button variant="outline-primary">
                    <i className="fa fa-pencil"></i> Upravit
                  </Button>&nbsp;
                  <Button variant="outline-danger"
                    onClick={() => {
                      this.props.deletePkg(pkgs[key]._id);
                    }}>
                    <i className="fa fa-times"></i> Smazat
                  </Button>
                </td>
              </tr>
            )}
            <tr key="new_pkg">
              <td></td>
              <td>
                <Form.Control ref={this.name} defaultValue="Nový balíček" />
              </td>
              <td>
                <Form.Control ref={this.color} defaultValue="#81d4fa" />
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

  handleSubmit(event) {
    event.preventDefault();

    this.props.addPkg({
      name: this.name.current.value,
      color: this.color.current.value,
    });
  }
}

export default Settings;
