import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byOrder } from "../helpers/Sorting";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addGroup, deleteGroup, updateGroup } from "../store/groupsSlice";
import Client from "../Client";

export default function Groups({ handleError }) {
  const [newName, setNewName] = useState("Nová skupina");
  const [newOrder, setNewOrder] = useState(0);
  const [editedName, setEditedName] = useState();
  const [editedOrder, setEditedOrder] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const { groups } = useSelector((state) => state.groups);
  const dispatch = useDispatch();

  const { token, table } = useSelector((state) => state.auth);
  const client = new Client(token, table);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      client
        .updateGroup({
          _id: editKey,
          name: editedName,
          order: editedOrder,
        })
        .then((resp) => dispatch(updateGroup(resp)), handleError);
      setEditKey(undefined);
    } else {
      client
        .addGroup({
          name: newName,
          order: newOrder,
        })
        .then((resp) => dispatch(addGroup(resp)), handleError);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <GroupsHeader />
        <tbody>
          {[...groups].sort(byOrder).map((group) =>
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
                  client
                    .deleteGroup(group._id)
                    .then(() => dispatch(deleteGroup(group._id)), handleError)
                }
                editGroup={() => {
                  setEditKey(group._id);
                  setEditedName(group.name);
                  setEditedOrder(group.order);
                }}
              />
            )
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
          onChange={(e) => setOrder(e.target.value)}
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
