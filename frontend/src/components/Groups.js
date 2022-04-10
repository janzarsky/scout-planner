import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default class Groups extends React.Component {
  constructor(props) {
    super(props);
    ["nameAddRef", "orderAddRef", "nameEditRef", "orderEditRef"].forEach(
      (field) => (this[field] = React.createRef())
    );
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { editKey: undefined };
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <GroupsHeader />
          <tbody>
            {[...this.props.groups.entries()]
              .sort(([, a], [, b]) => {
                if (a.order < b.order) return -1;
                if (a.order > b.order) return 1;
                return 0;
              })
              .map(([key, group], index) =>
                key === this.state.editKey ? (
                  <EditedGroup
                    key={key}
                    group={group}
                    nameRef={this.nameEditRef}
                    orderRef={this.orderEditRef}
                  />
                ) : (
                  <Group
                    key={key}
                    group={group}
                    deleteGroup={() => this.props.deleteGroup(group._id)}
                    editGroup={() => this.setState({ editKey: key })}
                  />
                )
              )}
            <NewGroup nameRef={this.nameAddRef} orderRef={this.orderAddRef} />
          </tbody>
        </Table>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    if (this.state.editKey) {
      this.props
        .updateGroup({
          _id: this.state.editKey,
          name: this.nameEditRef.current.value,
          order: this.orderEditRef.current.value,
        })
        .then(() => this.setState({ editKey: undefined }));
    } else {
      this.props.addGroup({
        name: this.nameAddRef.current.value,
        order: this.orderAddRef.current.value,
      });
    }
  }
}

function GroupsHeader() {
  return (
    <thead>
      <tr>
        <th>Skupina</th>
        <th>Pořadí</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Group(props) {
  return (
    <tr>
      <td>{props.group.name}</td>
      <td>{props.group.order}</td>
      <td>
        <span>
          <Button variant="link" onClick={props.editGroup}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={props.deleteGroup}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedGroup(props) {
  return (
    <tr>
      <td>
        <Form.Control ref={props.nameRef} defaultValue={props.group.name} />
      </td>
      <td>
        <Form.Control
          type="number"
          ref={props.orderRef}
          defaultValue={props.group.order}
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

function NewGroup(props) {
  return (
    <tr key="new_pkg">
      <td>
        <Form.Control ref={props.nameRef} defaultValue="Nová skupina" />
      </td>
      <td>
        <Form.Control type="number" ref={props.orderRef} defaultValue="1" />
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}
