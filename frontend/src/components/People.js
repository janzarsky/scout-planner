import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Table from "react-bootstrap/Table";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { addError } from "../store/errorsSlice";
import { addPerson, deletePerson, updatePerson } from "../store/peopleSlice";

export default function People() {
  const { people } = useSelector((state) => state.people);

  const [newName, setNewName] = useState("Nový organizátor");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      client
        .updatePerson({
          _id: editKey,
          name: editedName,
        })
        .then(
          (resp) => dispatch(updatePerson(resp)),
          (e) => dispatch(addError(e.message))
        );
      setEditKey(undefined);
    } else {
      client
        .addPerson({
          name: newName,
        })
        .then(
          (resp) => dispatch(addPerson(resp)),
          (e) => dispatch(addError(e.message))
        );
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Organizátor</th>
          </tr>
        </thead>
        <tbody>
          {[...people]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((person) =>
              person._id === editKey ? (
                <EditedPerson name={editedName} setName={setEditedName} />
              ) : (
                <Person
                  key={person._id}
                  name={person.name}
                  editPerson={() => {
                    setEditKey(person._id);
                    setEditedName(person.name);
                  }}
                  deletePerson={() =>
                    client.deletePerson(person._id).then(
                      () => dispatch(deletePerson(person._id)),
                      (e) => dispatch(addError(e.message))
                    )
                  }
                />
              )
            )}
          <EditedPerson name={newName} setName={setNewName} isNew={true} />
        </tbody>
      </Table>
    </Form>
  );
}

function Person({ name, deletePerson, editPerson }) {
  return (
    <tr>
      <td>{name}</td>
      <td>
        <span>
          <Button variant="link" onClick={editPerson}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={deletePerson}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedPerson({ name, setName, isNew = false }) {
  return (
    <tr>
      <td>
        <Form.Control
          data-test={isNew ? "people-new-name" : "people-edit-name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </td>
      <td>
        <Button
          data-test={isNew ? "people-new-add" : "people-edit-save"}
          variant="primary"
          type="submit"
        >
          {isNew ? (
            <>
              <i className="fa fa-plus" /> Přidat
            </>
          ) : (
            <>
              <i className="fa fa-check" /> Uložit
            </>
          )}
        </Button>
      </td>
    </tr>
  );
}