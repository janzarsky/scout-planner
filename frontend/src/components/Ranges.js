import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default class Ranges extends React.Component {
  constructor(props) {
    super(props);
    ["nameAddRef", "nameEditRef"].forEach(
      (field) => (this[field] = React.createRef())
    );
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { editKey: undefined };
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <RangesHeader />
          <tbody>
            {[...this.props.ranges]
              .sort((a, b) => {
                if (a.order < b.order) return -1;
                if (a.order > b.order) return 1;
                return 0;
              })
              .map((range) =>
                range._id === this.state.editKey ? (
                  <EditedRange
                    key={range._id}
                    range={range}
                    nameRef={this.nameEditRef}
                  />
                ) : (
                  <Range
                    key={range._id}
                    range={range}
                    deleteRange={() => this.props.deleteRange(range._id)}
                    editRange={() => this.setState({ editKey: range._id })}
                  />
                )
              )}
            <NewRange nameRef={this.nameAddRef} />
          </tbody>
        </Table>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.editKey) {
      this.props
        .updateRange({
          _id: this.state.editKey,
          name: this.nameEditRef.current.value,
        })
        .then(() => this.setState({ editKey: undefined }));
    } else {
      this.props.addRange({
        name: this.nameAddRef.current.value,
      });
    }
  }
}

function RangesHeader() {
  return (
    <thead>
      <tr>
        <th>Linka</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Range(props) {
  return (
    <tr>
      <td>{props.range.name}</td>
      <td>
        <span>
          <Button variant="link" onClick={props.editRange}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={props.deleteRange}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedRange(props) {
  return (
    <tr>
      <td>
        <Form.Control ref={props.nameRef} defaultValue={props.range.name} />
      </td>
      <td>
        <Button variant="primary" type="submit">
          <i className="fa fa-check" /> Uložit
        </Button>
      </td>
    </tr>
  );
}

function NewRange(props) {
  return (
    <tr key="new_range">
      <td>
        <Form.Control ref={props.nameRef} defaultValue="Nová linka" />
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}
