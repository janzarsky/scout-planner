import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Form from "react-bootstrap/esm/Form";
import Table from "react-bootstrap/Table";
import { useDispatch, useSelector } from "react-redux";
import { clientFactory } from "../Client";
import { convertLegacyPeople } from "../helpers/PeopleConvertor";
import { addError } from "../store/errorsSlice";
import { addPerson } from "../store/peopleSlice";

export default function People() {
  const { people, legacyPeople } = useSelector((state) => state.people);
  const allPeople = convertLegacyPeople(legacyPeople, people);

  const [newName, setNewName] = useState("Nový organizátor");

  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = clientFactory.getClient(table);

  function handleSubmit(event) {
    event.preventDefault();

    client
      .addPerson({
        name: newName,
      })
      .then(
        (resp) => dispatch(addPerson(resp)),
        (e) => dispatch(addError(e.message))
      );
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
          {[...allPeople]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((person) => (
              <tr key={person._id}>
                <td>{person.name}</td>
              </tr>
            ))}
          <EditedPerson name={newName} setName={setNewName} isNew={true} />
        </tbody>
      </Table>
    </Form>
  );
}

function EditedPerson({ name, setName, isNew = false }) {
  return (
    <tr>
      <td>
        <Form.Control
          data-test="people-new-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </td>
      <td>
        <Button data-test="people-new-add" variant="primary" type="submit">
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
