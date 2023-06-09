import { useCallback, useMemo, useState } from "react";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { byName } from "../helpers/Sorting";
import { useDispatch, useSelector } from "react-redux";
import {
  addPackage,
  deletePackage,
  updatePackage,
} from "../store/packagesSlice";
import { clientFactory } from "../Client";
import { addError } from "../store/errorsSlice";

export default function Packages() {
  const [newName, setNewName] = useState("Nový balíček");
  const [newColor, setNewColor] = useState("#81d4fa");
  const [editedName, setEditedName] = useState();
  const [editedColor, setEditedColor] = useState();
  const [editKey, setEditKey] = useState(undefined);

  const { packages } = useSelector((state) => state.packages);
  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = useMemo(() => clientFactory.getClient(table), [table]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (editKey) {
        client
          .updatePackage({
            _id: editKey,
            name: editedName,
            color: editedColor,
          })
          .then(
            (resp) => dispatch(updatePackage(resp)),
            (e) => dispatch(addError(e.message))
          );
        setEditKey(undefined);
      } else {
        client
          .addPackage({
            name: newName,
            color: newColor,
          })
          .then(
            (resp) => dispatch(addPackage(resp)),
            (e) => dispatch(addError(e.message))
          );
      }
    },
    [client, dispatch, editKey, editedColor, editedName, newColor, newName]
  );

  const deletePackageCallback = useCallback(
    (id) => {
      client.deletePackage(id).then(
        () => dispatch(deletePackage(id)),
        (e) => dispatch(addError(e.message))
      );
      setEditKey(undefined);
    },
    [client, dispatch, setEditKey]
  );

  const editPackageCallback = useCallback(
    (id, name, color) => {
      setEditKey(id);
      setEditedName(name);
      setEditedColor(color);
    },
    [setEditKey, setEditedName, setEditedColor]
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Table bordered hover responsive>
        <PackagesHeader />
        <tbody>
          {[...packages]
            .sort(byName)
            .map((pkg, index) =>
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
                  id={pkg._id}
                  name={pkg.name}
                  color={pkg.color}
                  cnt={index + 1}
                  deletePkg={deletePackageCallback}
                  editPkg={editPackageCallback}
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

function Package({ id, cnt, name, color, editPkg, deletePkg }) {
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
          <Button variant="link" onClick={() => editPkg(id, name, color)}>
            <i className="fa fa-pencil" /> Upravit
          </Button>
          &nbsp;
          <Button variant="link text-danger" onClick={() => deletePkg(id)}>
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
        <ColorPicker color={color} setColor={setColor} />
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
        <ColorPicker color={color} setColor={setColor} />
      </td>
      <td>
        <Button variant="success" type="submit">
          <i className="fa fa-plus" /> Přidat
        </Button>
      </td>
    </tr>
  );
}

function ColorPicker({ color, setColor }) {
  const defaultColor = "#eeeeee";
  const colors = [
    "#f48fb1",
    "#ce93d8",
    "#b39ddb",
    "#9fa8da",
    "#90caf9",
    "#81d4fa",
    "#80deea",
    "#80cbc4",
    "#a5d6a7",
    "#c5e1a5",
    "#e6ee9c",
    "#fff59d",
    "#ffe082",
    "#ffcc80",
    "#ffab91",
    "#bcaaa4",
    "#b0bec5",
    defaultColor,
  ];

  const [custom, setCustom] = useState(colors.indexOf(color) === -1);

  return (
    <>
      <Form.Select
        data-test="pkgs-new-color"
        value={custom ? "custom" : color}
        onChange={(e) => {
          if (e.target.value === "custom") {
            setCustom(true);
            setColor(defaultColor);
          } else {
            setCustom(false);
            setColor(e.target.value);
          }
        }}
        style={{ backgroundColor: color }}
      >
        {colors.map((color) => (
          <option key={color} value={color} style={{ backgroundColor: color }}>
            {color}
          </option>
        ))}
        <option
          key="custom"
          value="custom"
          style={{ backgroundColor: custom ? color : defaultColor }}
        >
          Vlastní barva
        </option>
      </Form.Select>
      {custom && (
        <Form.Control
          data-test="pkgs-new-custom-color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      )}
    </>
  );
}
