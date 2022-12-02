import { useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { level } from "../helpers/Level";
import { parseIntOrZero } from "../helpers/Parsing";

export default function Users({
  users,
  addUser,
  updateUser,
  deleteUser,
  userEmail,
}) {
  const [newEmail, setNewEmail] = useState("E-mailová adresa");
  const [newLevel, setNewLevel] = useState(0);
  const [editedEmail, setEditedEmail] = useState();
  const [editedLevel, setEditedLevel] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const publicUser = users.find((user) => user.email === "public");

  const [publicLevel, setPublicLevel] = useState(
    publicUser ? publicUser.level : 3
  );

  function handleSubmit(event) {
    event.preventDefault();

    // TODO refactor
    if (editKey && editKey === "public_user") {
      const publicUser = users.find((user) => user.email === "public");

      if (publicUser) {
        updateUser({
          _id: publicUser._id,
          email: publicUser.email,
          level: publicLevel,
        }).then(() => setEditKey(undefined));
      } else {
        addUser({
          email: "public",
          level: publicLevel,
        }).then(() => setEditKey(undefined));
      }
    } else if (editKey) {
      updateUser({
        _id: editKey,
        email: editedEmail,
        level: editedLevel,
      }).then(() => setEditKey(undefined));
    } else {
      addUser({
        email: newEmail,
        level: newLevel,
      });
    }
  }

  // allow editing of public user only in case the current user has ADMIN rights
  const publicUserEditable =
    userEmail &&
    users.some((user) => user.email === userEmail && user.level >= level.ADMIN);

  // allow editing of current user only in case they are other users with ADMIN rights
  // (or there is a implicit public user which also has ADMIN rights)
  const currentUserEditable =
    userEmail &&
    (!publicUser ||
      users.some(
        (user) => user.email !== userEmail && user.level >= level.ADMIN
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
              level={publicLevel}
              setLevel={setPublicLevel}
            />
          ) : (
            <PublicUser
              key="public_user"
              level={publicLevel}
              userEmail={userEmail}
              editable={publicUserEditable}
              editUser={() => setEditKey("public_user")}
            />
          )}
          {[...users]
            .sort((a, b) => a.email.localeCompare(b.email))
            .filter((user) => user.email !== "public")
            .map((user) =>
              user._id === editKey ? (
                <EditedUser
                  key={user._id}
                  email={editedEmail}
                  level={editedLevel}
                  setEmail={setEditedEmail}
                  setLevel={setEditedLevel}
                />
              ) : (
                <User
                  key={user._id}
                  email={user.email}
                  level={user.level}
                  editable={user.email !== userEmail || currentUserEditable}
                  currentUserWarning={
                    user.email === userEmail && currentUserWarning
                  }
                  deleteUser={() => deleteUser(user._id)}
                  editUser={() => {
                    setEditKey(user._id);
                    setEditedEmail(user.email);
                    setEditedLevel(user.level);
                  }}
                />
              )
            )}
          <NewUser
            email={newEmail}
            level={newLevel}
            setEmail={setNewEmail}
            setLevel={setNewLevel}
          />
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

function User({
  email,
  level,
  editable,
  editUser,
  deleteUser,
  currentUserWarning,
}) {
  return (
    <tr>
      <td>{email}</td>
      <td>{formatLevel(level)}</td>
      <td>
        {editable ? (
          <span>
            <Button variant="link" onClick={editUser}>
              <i className="fa fa-pencil" /> Upravit
            </Button>
            &nbsp;
            <Button variant="link text-danger" onClick={deleteUser}>
              <i className="fa fa-trash" /> Smazat
            </Button>
            {currentUserWarning &&
              "Upozornění: pokud změníte vlastní oprávnění, ztratíte přístup ke správě uživatelů."}
          </span>
        ) : (
          "Pro úpravu přidejte alespoň jednoho dalšího uživatele s oprávněním spravovat uživatele."
        )}
      </td>
    </tr>
  );
}

function EditedUser({ email, setEmail, level, setLevel }) {
  return (
    <tr>
      <td>
        <Form.Control
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </td>
      <td>
        <Form.Control
          as="select"
          value={level}
          onChange={(e) => setLevel(parseIntOrZero(e.target.value))}
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

function NewUser({ email, setEmail, level, setLevel }) {
  return (
    <tr>
      <td>
        <Form.Control
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </td>
      <td>
        <Form.Control
          as="select"
          value={level}
          onChange={(e) => setLevel(parseIntOrZero(e.target.value))}
        >
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

function PublicUser({ level, editable, editUser, userEmail }) {
  return (
    <tr>
      <td>Kdokoliv</td>
      <td>{formatLevel(level)}</td>
      <td>
        {editable && (
          <Button variant="link" onClick={editUser}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
        )}
        {!editable &&
          !userEmail &&
          "Pro změnu veřejného přístupu se přihlaste."}
        {!editable &&
          userEmail &&
          `Pro změnu veřejného přístupu nejdříve nastavte oprávnění "spravovat uživatele" pro e-mailovou adresu "${userEmail}".`}
      </td>
    </tr>
  );
}

function PublicEditedUser({ level, setLevel }) {
  return (
    <tr>
      <td>Kdokoliv</td>
      <td>
        <Form.Control
          as="select"
          value={level}
          onChange={(e) => setLevel(parseIntOrZero(e.target.value))}
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
