import React from "react";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";
import { useCloneMutation } from "../store/cloneApi";
import { useAuth } from "./AuthProvider";

export default function Clone() {
  const [destination, setDestination] = useState(null);

  const { table } = useSelector((state) => state.auth);
  const [cloneRtk] = useCloneMutation();
  const { getIdToken } = useAuth();

  async function handleSubmit(event) {
    event.preventDefault();

    const token = await getIdToken();

    // TODO: extract ID generation to a helper function
    const dest =
      destination ?? `/${Math.floor(Math.random() * 10e13).toString(16)}`;

    cloneRtk({ source: table, destination: dest, token });
  }

  return (
    <>
      <h3>Vytvořit kopii</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Label column sm="2">
            Cílové ID
          </Form.Label>
          <Col sm="3" className="mb-2">
            <Form.Control
              value={destination ?? ""}
              placeholder={destination ? "" : "(vygenerovat automaticky)"}
              onChange={(e) => setDestination(e.target.value)}
            />
          </Col>
          <Col sm="7" className="mb-2">
            <Button type="submit">
              <i className="fa fa-clone"></i> Vytvořit kopii
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}
