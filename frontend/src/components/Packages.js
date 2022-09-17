import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byName } from "../helpers/Sorting";

export default class Packages extends React.Component {
  constructor(props) {
    super(props);
    ["nameAddRef", "colorAddRef", "nameEditRef", "colorEditRef"].forEach(
      (field) => (this[field] = React.createRef())
    );
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { editKey: undefined };
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <PackagesHeader />
          <tbody>
            {[...this.props.pkgs]
              .sort(byName)
              .map((pkg, index) =>
                pkg._id === this.state.editKey ? (
                  <EditedPackage
                    key={pkg._id}
                    pkg={pkg}
                    cnt={index + 1}
                    nameRef={this.nameEditRef}
                    colorRef={this.colorEditRef}
                  />
                ) : (
                  <Package
                    key={pkg._id}
                    pkg={pkg}
                    cnt={index + 1}
                    deletePkg={() => this.props.deletePkg(pkg._id)}
                    editPkg={() => this.setState({ editKey: pkg._id })}
                  />
                )
              )}
            <NewPackage nameRef={this.nameAddRef} colorRef={this.colorAddRef} />
          </tbody>
        </Table>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.editKey) {
      this.props
        .updatePkg({
          _id: this.state.editKey,
          name: this.nameEditRef.current.value,
          color: this.colorEditRef.current.value,
        })
        .then(() => this.setState({ editKey: undefined }));
    } else {
      this.props.addPkg({
        name: this.nameAddRef.current.value,
        color: this.colorAddRef.current.value,
      });
    }
  }
}

function PackagesHeader() {
  return (
    <thead>
      <tr>
        <th>#</th>
        <th>Balíček</th>
        <th>Barva</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Package(props) {
  return (
    <tr>
      <td>{props.cnt}</td>
      <td>{props.pkg.name}</td>
      <td>
        <span
          className="color-sample"
          style={{ backgroundColor: props.pkg.color }}
        >
          &nbsp;
        </span>{" "}
        {props.pkg.color}
      </td>
      <td>
        <span>
          <Button variant="link" onClick={props.editPkg}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={props.deletePkg}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedPackage(props) {
  return (
    <tr>
      <td>{props.cnt}</td>
      <td>
        <Form.Control ref={props.nameRef} defaultValue={props.pkg.name} />
      </td>
      <td>
        <Form.Control
          type="color"
          ref={props.colorRef}
          defaultValue={props.pkg.color}
        />
      </td>
      <td>
        <Button variant="primary" type="submit">
          <i className="fa fa-check" /> Uložit
        </Button>
      </td>
    </tr>
  );
}

function NewPackage(props) {
  return (
    <tr key="new_pkg">
      <td></td>
      <td>
        <Form.Control ref={props.nameRef} defaultValue="Nový balíček" />
      </td>
      <td>
        <Form.Control
          type="color"
          ref={props.colorRef}
          defaultValue="#81d4fa"
        />
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}
