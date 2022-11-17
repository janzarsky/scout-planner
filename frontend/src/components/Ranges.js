import { useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byName } from "../helpers/Sorting";

export default function Ranges(props) {
  const [newName, setNewName] = useState("Nová linka");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      props
        .updateRange({ _id: editKey, name: editedName })
        .then(() => setEditKey(undefined));
    } else {
      props.addRange({ name: newName });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <RangesHeader />
        <tbody>
          {[...props.ranges].sort(byName).map((range) =>
            range._id === editKey ? (
              <EditedRange
                key={range._id}
                name={editedName}
                setName={setEditedName}
              />
            ) : (
              <Range
                key={range._id}
                range={range}
                deleteRange={() => props.deleteRange(range._id)}
                editRange={() => {
                  setEditKey(range._id);
                  setEditedName(range.name);
                }}
              />
            )
          )}
          <NewRange name={newName} setName={setNewName} />
        </tbody>
      </Table>
    </Form>
  );
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
        <Form.Control
          value={props.name}
          onChange={(e) => props.setName(e.target.value)}
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

function NewRange(props) {
  return (
    <tr>
      <td>
        <Form.Control
          value={props.name}
          onChange={(e) => props.setName(e.target.value)}
        />
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}
