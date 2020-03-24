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
    const pkgs = this.props.pkgs;
    return (
      <Table striped bordered hover responsive>
        <thead>
          <th>Balíček</th>
          <th>Barva</th>
          <th><Button variant="success"><i className="fa fa-plus"></i> Přidat</Button></th>
        </thead>
        <tbody>
          {Object.keys(pkgs).map((key) =>
            <tr key={key}>
              <td>{pkgs[key].name}</td>
              <td>{pkgs[key].color}</td>
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
}

export default Settings;
