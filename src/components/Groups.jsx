import React from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byOrder } from "../helpers/Sorting";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  addGroup,
  deleteGroup,
  updateGroup,
  useGetGroupsSlice,
} from "../store/groupsSlice";
import { firestoreClientFactory } from "../FirestoreClient";
import { parseIntOrZero } from "../helpers/Parsing";
import { useCommandHandler } from "./CommandContext";

export default function Groups() {
  const [newName, setNewName] = useState("Nová skupina");
  const [newOrder, setNewOrder] = useState(0);
  const [editedName, setEditedName] = useState();
  const [editedOrder, setEditedOrder] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const { table } = useSelector((state) => state.auth);

  const { data: groups, isSuccess: groupsLoaded } = useGetGroupsSlice(table);
  const { dispatchCommand } = useCommandHandler();

  const client = firestoreClientFactory.getClient(table);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      const updatedGroup = {
        _id: editKey,
        name: editedName,
        order: editedOrder,
      };
      dispatchCommand(client, updateGroup(updatedGroup));
      setEditKey(undefined);
    } else {
      dispatchCommand(client, addGroup({ name: newName, order: newOrder }));
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
                  deleteGroup={() =>
                    dispatchCommand(client, deleteGroup(group._id))
                  }
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
