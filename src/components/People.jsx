import React from "react";
import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Table from "react-bootstrap/Table";
import { useSelector } from "react-redux";
import { formatDateTime, parseDateTime } from "../helpers/DateUtils";
import {
  useAddPersonMutation,
  useDeletePersonMutation,
  useGetPeopleQuery,
  useUpdatePersonMutation,
} from "../store/peopleApi";

export default function People() {
  const { table } = useSelector((state) => state.auth);
  const { data: people, isSuccess: peopleLoaded } = useGetPeopleQuery(table);
  const [updatePerson] = useUpdatePersonMutation();
  const [addPerson] = useAddPersonMutation();
  const [deletePerson] = useDeletePersonMutation();

  const [newName, setNewName] = useState("Nový organizátor");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);
  const [absence, setAbsence] = useState();

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      const updatedPerson = {
        _id: editKey,
        name: editedName,
        absence: parseAbsence(absence),
      };
      updatePerson({ table, data: updatedPerson });
      setEditKey(undefined);
    } else {
      addPerson({ table, data: { name: newName } });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Organizátor</th>
            <th>
              Účast{" "}
              <i className="fa fa-flask text-secondary" aria-hidden="true"></i>{" "}
              <small className="text-secondary">Experimentální funkce</small>
            </th>
            <th>Akce</th>
          </tr>
        </thead>
        <tbody>
          {peopleLoaded &&
            [...people]
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
                    deletePerson={() => deletePerson({ table, id: person._id })}
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
  return (
    <tr>
      <td>{name}</td>
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
  const datepicker = useSelector((state) => state.config.datepicker);

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
