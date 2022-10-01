import { useRef, useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { level } from "../helpers/Level";

export default function Users(props) {
  const emailAddRef = useRef();
  const emailEditRef = useRef();
  const levelAddRef = useRef();
  const levelEditRef = useRef();
  const publicLevelRef = useRef();
  const [editKey, setEditKey] = useState(undefined);

  function handleSubmit(event) {
    event.preventDefault();

    // TODO refactor
    if (editKey && editKey === "public_user") {
      let level = parseInt(publicLevelRef.current.value);
      if (isNaN(level)) level = 0;

      const publicUser = props.users.find((user) => user.email === "public");

      if (publicUser) {
        props
          .updateUser({
            _id: publicUser._id,
            email: publicUser.email,
            level: level,
          })
          .then(() => setEditKey(undefined));
      } else {
        props
          .addUser({
            email: "public",
            level: level,
          })
          .then(() => setEditKey(undefined));
      }
    } else if (editKey) {
      let level = parseInt(levelEditRef.current.value);
      if (isNaN(level)) level = 0;

      props
        .updateUser({
          _id: editKey,
          email: emailEditRef.current.value,
          level: level,
        })
        .then(() => setEditKey(undefined));
    } else {
      let level = parseInt(levelAddRef.current.value);
      if (isNaN(level)) level = 0;

      props.addUser({
        email: emailAddRef.current.value,
        level: level,
      });
    }
  }

  const publicUser = props.users.find((user) => user.email === "public");

  // allow editing of public user only in case the current user has ADMIN rights
  const publicUserEditable =
    props.userEmail &&
    props.users.some(
      (user) => user.email === props.userEmail && user.level >= level.ADMIN
    );

  // allow editing of current user only in case they are other users with ADMIN rights
  // (or there is a implicit public user which also has ADMIN rights)
  const currentUserEditable =
    props.userEmail &&
    (!publicUser ||
      props.users.some(
        (user) => user.email !== props.userEmail && user.level >= level.ADMIN
      ));

  // when it is allowed to edit current user, there is a warning about losing access,
  // the warning should not be shown in case there is still public ADMIN access
  const currentUserWarning =
    currentUserEditable && publicUser && publicUser.level < level.ADMIN;

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <UsersHeader />
        <tbody>
          {editKey === "public_user" ? (
            <PublicEditedUser
              key="public_user"
              level={publicUser ? publicUser.level : 3}
              levelRef={publicLevelRef}
            />
          ) : (
            <PublicUser
              key="public_user"
              level={publicUser ? publicUser.level : 3}
              userEmail={props.userEmail}
              editable={publicUserEditable}
              editUser={() => setEditKey("public_user")}
            />
          )}
          {[...props.users]
            .sort((a, b) => a.email.localeCompare(b.email))
            .filter((user) => user.email !== "public")
            .map((user) =>
              user._id === editKey ? (
                <EditedUser
                  key={user._id}
                  user={user}
                  emailRef={emailEditRef}
                  levelRef={levelEditRef}
                />
              ) : (
                <User
                  key={user._id}
                  user={user}
                  editable={
                    user.email !== props.userEmail || currentUserEditable
                  }
                  currentUserWarning={
                    user.email === props.userEmail && currentUserWarning
                  }
                  deleteUser={() => props.deleteUser(user._id)}
                  editUser={() => setEditKey(user._id)}
                />
              )
            )}
          <NewUser emailRef={emailAddRef} levelRef={levelAddRef} />
        </tbody>
      </Table>
    </Form>
  );
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
        {props.editable ? (
          <span>
            <Button variant="link" onClick={props.editUser}>
              <i className="fa fa-pencil" /> Upravit
            </Button>
            &nbsp;
            <Button variant="link text-danger" onClick={props.deleteUser}>
              <i className="fa fa-trash" /> Smazat
            </Button>
            {props.currentUserWarning &&
              "Upozornění: pokud změníte vlastní oprávnění, ztratíte přístup ke správě uživatelů."}
          </span>
        ) : (
          "Pro úpravu přidejte alespoň jednoho dalšího uživatele s oprávněním spravovat uživatele."
        )}
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
        {props.editable && (
          <Button variant="link" onClick={props.editUser}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
        )}
        {!props.editable &&
          !props.userEmail &&
          "Pro změnu veřejného přístupu se přihlaste."}
        {!props.editable &&
          props.userEmail &&
          `Pro změnu veřejného přístupu nejdříve nastavte oprávnění "spravovat uživatele" pro e-mailovou adresu "${props.userEmail}".`}
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
