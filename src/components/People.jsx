import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Table from "react-bootstrap/Table";
import { useDispatch, useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";
import { addError } from "../store/errorsSlice";
import { addPerson, deletePerson, updatePerson } from "../store/peopleSlice";
import { formatDateTime, parseDateTime } from "../helpers/DateUtils";

export default function People() {
  const { people } = useSelector((state) => state.people);

  const [newName, setNewName] = useState("Nový organizátor");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);
  const [absence, setAbsence] = useState();

  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = firestoreClientFactory.getClient(table);

  const attendanceFlag = useSelector((state) => state.config.attendance);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      client
        .updatePerson({
          _id: editKey,
          name: editedName,
          absence: parseAbsence(absence),
        })
        .then(
          (resp) => dispatch(updatePerson(resp)),
          (e) => dispatch(addError(e.message)),
        );
      setEditKey(undefined);
    } else {
      client
        .addPerson({
          name: newName,
        })
        .then(
          (resp) => dispatch(addPerson(resp)),
          (e) => dispatch(addError(e.message)),
        );
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Organizátor</th>
            {attendanceFlag && (
              <th>
                Účast{" "}
                <i
                  className="fa fa-flask text-secondary"
                  aria-hidden="true"
                ></i>{" "}
                <small className="text-secondary">Experimentální funkce</small>
              </th>
            )}
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
                  absence={absence}
                  setAbsence={setAbsence}
                />
              ) : (
                <Person
                  key={person._id}
                  name={person.name}
                  absence={person.absence}
                  editPerson={() => {
                    setEditKey(person._id);
                    setEditedName(person.name);
                    setAbsence(
                      formatAbsence(person.absence ? person.absence : []),
                    );
                  }}
                  deletePerson={() =>
                    client.deletePerson(person._id).then(
                      () => dispatch(deletePerson(person._id)),
                      (e) => dispatch(addError(e.message)),
                    )
                  }
                />
              ),
            )}
          <EditedPerson name={newName} setName={setNewName} isNew={true} />
        </tbody>
      </Table>
    </Form>
  );
}

function Person({ name, absence, deletePerson, editPerson }) {
  const attendanceFlag = useSelector((state) => state.config.attendance);

  return (
    <tr>
      <td>{name}</td>
      {attendanceFlag && (
        <td>
          {absence && absence.length > 0
            ? "chybí " +
              absence
                .map(
                  (entry) =>
                    `od ${formatDateTime(entry.begin)} do ${formatDateTime(
                      entry.end,
                    )}`,
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

function EditedPerson({
  name,
  setName,
  absence = null,
  setAbsence = null,
  isNew = false,
}) {
  const { attendance: attendanceFlag, datepicker } = useSelector(
    (state) => state.config,
  );

  return (
    <tr>
      <td>
        <Form.Control
          data-test={isNew ? "people-new-name" : "people-edit-name"}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </td>
      {attendanceFlag && (
        <td>
          {absence !== null &&
            (datepicker ? (
              <AbsenceSelector absence={absence} setAbsence={setAbsence} />
            ) : (
              <Form.Control
                value={absence}
                onChange={(e) => setAbsence(e.target.value)}
                placeholder="HH:MM DD.MM.YYYY - HH:MM DD.MM.YYYY, HH:MM..."
              />
            ))}
        </td>
      )}
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

function AbsenceSelector({ absence, setAbsence }) {
  return (
    <Form.Control
      value={absence}
      onChange={(e) => setAbsence(e.target.value)}
      placeholder="HH:MM DD.MM.YYYY - HH:MM DD.MM.YYYY, HH:MM..."
    />
  );
}

function formatAbsence(absence) {
  return absence
    .map(
      (entry) =>
        `${formatDateTime(entry.begin)} - ${formatDateTime(entry.end)}`,
    )
    .join(", ");
}

function parseAbsence(absence) {
  if (typeof absence !== "string") return [];
  if (absence === "") return [];

  return absence
    .split(",")
    .map((entry) => entry.trim())
    .map((entry) => {
      const times = entry
        .split("-", 2)
        .map((time) => time.trim())
        .map((time) => parseDateTime(time));

      return { begin: times[0], end: times[1] };
    });
}
