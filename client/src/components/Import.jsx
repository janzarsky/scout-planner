import React from "react";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { firestoreClientFactory } from "../FirestoreClient";
import { useDispatch, useSelector } from "react-redux";
import { importData } from "@scout-planner/common/importer";
import { addError } from "../store/errorsSlice";

export default function Import() {
  const [dataToImport, setDataToImport] = useState();

  const { table } = useSelector((state) => state.auth);
  const client = firestoreClientFactory.getClient(table);
  const dispatch = useDispatch();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const data = JSON.parse(dataToImport);
      await importData(data, client);

      window.location.reload();
    } catch {
      dispatch(addError("Během importu nastala chyba"));
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Data k importu:</Form.Label>
        <Form.Control
          as="textarea"
          value={dataToImport}
          onChange={(e) => setDataToImport(e.target.value)}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Button type="submit">
          <i className="fa fa-cloud-upload"></i> Importovat
        </Button>
      </Form.Group>
    </Form>
  );
}
