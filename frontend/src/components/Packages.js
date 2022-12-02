import { useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byName } from "../helpers/Sorting";

export default function Packages({ pkgs, addPkg, updatePkg, deletePkg }) {
  const [newName, setNewName] = useState("Nový balíček");
  const [newColor, setNewColor] = useState("#81d4fa");
  const [editedName, setEditedName] = useState();
  const [editedColor, setEditedColor] = useState();
  const [editKey, setEditKey] = useState(undefined);

  function handleSubmit(event) {
    event.preventDefault();

    if (editKey) {
      updatePkg({
        _id: editKey,
        name: editedName,
        color: editedColor,
      }).then(() => setEditKey(undefined));
    } else {
      addPkg({
        name: newName,
        color: newColor,
      });
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <PackagesHeader />
        <tbody>
          {[...pkgs].sort(byName).map((pkg, index) =>
            pkg._id === editKey ? (
              <EditedPackage
                key={pkg._id}
                name={editedName}
                color={editedColor}
                cnt={index + 1}
                setName={setEditedName}
                setColor={setEditedColor}
              />
            ) : (
              <Package
                key={pkg._id}
                name={pkg.name}
                color={pkg.color}
                cnt={index + 1}
                deletePkg={() => {
                  deletePkg(pkg._id);
                  setEditKey(undefined);
                }}
                editPkg={() => {
                  setEditKey(pkg._id);
                  setEditedName(pkg.name);
                  setEditedColor(pkg.color);
                }}
              />
            )
          )}
          <NewPackage
            name={newName}
            color={newColor}
            setName={setNewName}
            setColor={setNewColor}
          />
        </tbody>
      </Table>
    </Form>
  );
}

function PackagesHeader() {
  return (
    <thead>
      <tr>
        <th>#</th>
        <th>Balíček</th>
        <th>Barva</th>
        <th>Akce</th>
      </tr>
    </thead>
  );
}

function Package({ cnt, name, setName, color, setColor, editPkg, deletePkg }) {
  return (
    <tr>
      <td>{cnt}</td>
      <td>{name}</td>
      <td>
        <span className="color-sample" style={{ backgroundColor: color }}>
          &nbsp;
        </span>{" "}
        {color}
      </td>
      <td>
        <span>
          <Button variant="link" onClick={editPkg}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={deletePkg}>
            <i className="fa fa-trash" /> Smazat
          </Button>
        </span>
      </td>
    </tr>
  );
}

function EditedPackage({ cnt, name, setName, color, setColor }) {
  return (
    <tr>
      <td>{cnt}</td>
      <td>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <Form.Control
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
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

function NewPackage({ name, setName, color, setColor }) {
  return (
    <tr key="new_pkg">
      <td></td>
      <td>
        <Form.Control value={name} onChange={(e) => setName(e.target.value)} />
      </td>
      <td>
        <Form.Control
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
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
