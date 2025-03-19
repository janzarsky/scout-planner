import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byOrder } from "../helpers/Sorting";
import { useState } from "react";
import { useSelector } from "react-redux";
import { parseIntOrZero } from "../helpers/Parsing";
import {
  useAddGroupMutation,
  useDeleteGroupMutation,
  useGetGroupsQuery,
  useUpdateGroupMutation,
} from "../store/groupsApi";

export default function Groups() {
  const [newName, setNewName] = useState("Nová skupina");
  const [newOrder, setNewOrder] = useState(0);
  const [editedName, setEditedName] = useState();
  const [editedOrder, setEditedOrder] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const { table } = useSelector((state) => state.auth);

  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsQuery(table);
  const [updateGroup] = useUpdateGroupMutation();
  const [addGroup] = useAddGroupMutation();
  const [deleteGroup] = useDeleteGroupMutation();

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      const updatedGroup = {
        _id: editKey,
        name: editedName,
        order: editedOrder,
      };
      updateGroup({ table, data: updatedGroup });
      setEditKey(undefined);
    } else {
      addGroup({ table, data: { name: newName, order: newOrder } });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <GroupsHeader />
        <tbody>
          {groupsLoaded &&
            [...groups].sort(byOrder).map((group) =>
              group._id === editKey ? (
                <EditedGroup
                  key={group._id}
                  name={editedName}
                  order={editedOrder}
                  setName={setEditedName}
                  setOrder={setEditedOrder}
                />
              ) : (
                <Group
                  key={group._id}
                  name={group.name}
                  order={group.order}
                  deleteGroup={() => deleteGroup({ table, id: group._id })}
                  editGroup={() => {
                    setEditKey(group._id);
                    setEditedName(group.name);
                    setEditedOrder(group.order);
                  }}
                />
              ),
            )}
          <EditedGroup
            name={newName}
            order={newOrder}
            setName={setNewName}
            setOrder={setNewOrder}
            isNew={false}
          />
        </tbody>
      </Table>
    </Form>
  );
}

function GroupsHeader() {
  return (
    <thead>
      <tr>
        <th>Skupina</th>
        <th>Pořadí</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Group({ name, order, editGroup, deleteGroup }) {
  return (
    <tr>
      <td>{name}</td>
      <td>{order}</td>
      <td>
        <span>
          <Button variant="link" onClick={editGroup}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={deleteGroup}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedGroup({ name, order, setName, setOrder, isNew = false }) {
  return (
    <tr>
      <td>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <Form.Control
          type="number"
          value={order}
          onChange={(e) => setOrder(parseIntOrZero(e.target.value))}
        />
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
