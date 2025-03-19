import React from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byName } from "../helpers/Sorting";
import {
  useAddRangeMutation,
  useDeleteRangeMutation,
  useGetRangesQuery,
  useUpdateRangeMutation,
} from "../store/rangesApi";

export default function Ranges() {
  const [newName, setNewName] = useState("Nová linka");
  const [editedName, setEditedName] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const { table } = useSelector((state) => state.auth);

  const { data: ranges, isSuccess: rangesLoaded } = useGetRangesQuery(table);

  const [addRangeRtk] = useAddRangeMutation();
  const [updateRangeRtk] = useUpdateRangeMutation();
  const [deleteRangeRtk] = useDeleteRangeMutation();

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      updateRangeRtk({ table, data: { _id: editKey, name: editedName } });
      setEditKey(undefined);
    } else {
      addRangeRtk({ table, data: { name: newName } });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <RangesHeader />
        <tbody>
          {rangesLoaded &&
            [...ranges].sort(byName).map((range) =>
              range._id === editKey ? (
                <EditedRange
                  key={range._id}
                  name={editedName}
                  setName={setEditedName}
                />
              ) : (
                <Range
                  key={range._id}
                  name={range.name}
                  deleteRange={() => deleteRangeRtk({ table, id: range._id })}
                  editRange={() => {
                    setEditKey(range._id);
                    setEditedName(range.name);
                  }}
                />
              ),
            )}
          <EditedRange name={newName} setName={setNewName} isNew={true} />
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

function Range({ name, editRange, deleteRange }) {
  return (
    <tr>
      <td>{name}</td>
      <td>
        <span>
          <Button variant="link" onClick={editRange}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={deleteRange}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedRange({ name, setName, isNew = false }) {
  return (
    <tr>
      <td>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <Button variant="primary" type="submit">
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
