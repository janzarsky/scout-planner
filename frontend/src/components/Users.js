import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

export default class Users extends React.Component {
  constructor(props) {
    super(props);
    [
      "emailAddRef",
      "emailEditRef",
      "levelAddRef",
      "levelEditRef",
      "publicLevelRef",
    ].forEach((field) => (this[field] = React.createRef()));
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { editKey: undefined };
  }

  render() {
    const publicUser = this.props.users.find((user) => user.email === "public");
    return (
      <Form onSubmit={this.handleSubmit}>
        <Table bordered hover responsive>
          <UsersHeader />
          <tbody>
            {this.state.editKey === "public_user" ? (
              <PublicEditedUser
                key="public_user"
                level={publicUser ? publicUser.level : 3}
                levelRef={this.publicLevelRef}
              />
            ) : (
              <PublicUser
                key="public_user"
                level={publicUser ? publicUser.level : 3}
                editUser={() => this.setState({ editKey: "public_user" })}
              />
            )}
            {[...this.props.users]
              .sort((a, b) => a.email.localeCompare(b.email))
              .filter((user) => user.email !== "public")
              .map((user) =>
                user._id === this.state.editKey ? (
                  <EditedUser
                    key={user._id}
                    user={user}
                    emailRef={this.emailEditRef}
                    levelRef={this.levelEditRef}
                  />
                ) : (
                  <User
                    key={user._id}
                    user={user}
                    deleteUser={() => this.props.deleteUser(user._id)}
                    editUser={() => this.setState({ editKey: user._id })}
                  />
                )
              )}
            <NewUser emailRef={this.emailAddRef} levelRef={this.levelAddRef} />
          </tbody>
        </Table>
      </Form>
    );
  }

  handleSubmit(event) {
    event.preventDefault();

    // TODO refactor
    if (this.state.editKey && this.state.editKey === "public_user") {
      let level = parseInt(this.publicLevelRef.current.value);
      if (isNaN(level)) level = 0;

      const publicUser = this.props.users.find(
        (user) => user.email === "public"
      );

      if (publicUser) {
        this.props
          .updateUser({
            _id: publicUser._id,
            email: publicUser.email,
            level: level,
          })
          .then(() => this.setState({ editKey: undefined }));
      } else {
        this.props
          .addUser({
            email: "public",
            level: level,
          })
          .then(() => this.setState({ editKey: undefined }));
      }
    } else if (this.state.editKey) {
      let level = parseInt(this.levelEditRef.current.value);
      if (isNaN(level)) level = 0;

      this.props
        .updateUser({
          _id: this.state.editKey,
          email: this.emailEditRef.current.value,
          level: level,
        })
        .then(() => this.setState({ editKey: undefined }));
    } else {
      let level = parseInt(this.levelAddRef.current.value);
      if (isNaN(level)) level = 0;

      this.props.addUser({
        email: this.emailAddRef.current.value,
        level: level,
      });
    }
  }
}

function UsersHeader() {
  return (
    <thead>
      <tr>
        <th>E-mail</th>
        <th>Oprávnění</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function formatLevel(level) {
  switch (level) {
    case 0:
      return "žádné";
    case 1:
      return "zobrazovat";
    case 2:
      return "upravovat";
    case 3:
      return "spravovat uživatele";
    default:
      return "";
  }
}

function User(props) {
  return (
    <tr>
      <td>{props.user.email}</td>
      <td>{formatLevel(props.user.level)}</td>
      <td>
        <span>
          <Button variant="link" onClick={props.editUser}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={props.deleteUser}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedUser(props) {
  return (
    <tr>
      <td>
        <Form.Control ref={props.emailRef} defaultValue={props.user.email} />
      </td>
      <td>
        <Form.Control
          as="select"
          defaultValue={props.user.level}
          ref={props.levelRef}
        >
          {[0, 1, 2, 3].map((level) => (
            <option key={level} value={level}>
              {formatLevel(level)}
            </option>
          ))}
        </Form.Control>
      </td>
      <td>
        <Button variant="primary" type="submit">
          <i className="fa fa-check" /> Uložit
        </Button>
      </td>
    </tr>
  );
}

function NewUser(props) {
  return (
    <tr>
      <td>
        <Form.Control ref={props.emailRef} defaultValue="Nový uživatel" />
      </td>
      <td>
        <Form.Control as="select" defaultValue={0} ref={props.levelRef}>
          {[0, 1, 2, 3].map((level) => (
            <option key={level} value={level}>
              {formatLevel(level)}
            </option>
          ))}
        </Form.Control>
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}

function PublicUser(props) {
  return (
    <tr>
      <td>Kdokoliv</td>
      <td>{formatLevel(props.level)}</td>
      <td>
        <Button variant="link" onClick={props.editUser}>
          <i className="fa fa-pencil" /> Upravit
        </Button>
      </td>
    </tr>
  );
}

function PublicEditedUser(props) {
  return (
    <tr>
      <td>Kdokoliv</td>
      <td>
        <Form.Control
          as="select"
          defaultValue={props.level}
          ref={props.levelRef}
        >
          {[0, 1, 2, 3].map((level) => (
            <option key={level} value={level}>
              {formatLevel(level)}
            </option>
          ))}
        </Form.Control>
      </td>
      <td>
        <Button variant="primary" type="submit">
          <i className="fa fa-check" /> Uložit
        </Button>
      </td>
    </tr>
  );
}