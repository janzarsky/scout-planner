import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Table from "react-bootstrap/Table";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { addError } from "../store/errorsSlice";
import { addPerson, deletePerson, updatePerson } from "../store/peopleSlice";
import { formatDateTime } from "../helpers/DateUtils";

export default function People() {
  const { people } = useSelector((state) => state.people);

  const [newName, setNewName] = useState("Nový organizátor");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  const attendance = useSelector((state) => state.config.attendance);

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
            {attendance && <th>Účast</th>}
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {[...people]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((person) =>
              person._id === editKey ? (
                <EditedPerson
                  key="edited"
                  name={editedName}
                  setName={setEditedName}
                />
              ) : (
                <Person
                  key={person._id}
                  name={person.name}
                  attendance={person.attendance}
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

function Person({ name, attendance, deletePerson, editPerson }) {
  const attendanceFlag = useSelector((state) => state.config.attendance);

  return (
    <tr>
      <td>{name}</td>
      {attendanceFlag && (
        <td>
          {attendance && attendance.length > 0
            ? attendance
                .map(
                  (entry) =>
                    `chybí od ${formatDateTime(
                      entry.begin
                    )} do ${formatDateTime(entry.end)}`
                )
                .join(", ")
            : "celou dobu"}
        </td>
      )}
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
  const attendanceFlag = useSelector((state) => state.config.attendance);

  return (
    <tr>
      <td>
        <Form.Control
          data-test={isNew ? "people-new-name" : "people-edit-name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </td>
      {attendanceFlag && <td></td>}
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
