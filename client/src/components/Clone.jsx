import React from "react";
import { useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { useSelector } from "react-redux";
import { Col, Row } from "react-bootstrap";
import { useCloneMutation } from "../store/cloneApi";
import { useAuth } from "./AuthProvider";
import { isValidTimetableId } from "@scout-planner/common/timetableIdValidator";

export default function Clone() {
  const [destination, setDestination] = useState(null);
  const [destValid, setDestValid] = useState(true);

  const { table } = useSelector((state) => state.auth);
  const [cloneRtk] = useCloneMutation();
  const { user, getIdToken } = useAuth();

  function handleDestChange(destination) {
    setDestination(destination);
    setDestValid(
      !destination ||
        (isValidTimetableId(destination) && destination !== table),
    );
  }

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
      {!user && (
        <p className="text-danger">
          <i className="fa fa-exclamation-triangle" />
          &nbsp; Pro kopírování se prosím přihlaste
        </p>
      )}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Label column sm="2">
            Cílové ID
          </Form.Label>
          <Col sm="3" className="mb-2">
            <Form.Control
              value={destination ?? ""}
              placeholder={destination ? "" : "(vygenerovat automaticky)"}
              onChange={(e) => handleDestChange(e.target.value)}
              isValid={destination && destValid}
              isInvalid={!destValid}
              disabled={!user}
            />
            <Form.Control.Feedback type="invalid">
              {destination && destination.length < 3
                ? "Cílové ID musí mít alespoň tři znaky"
                : destination === table
                  ? "Cílové ID nesmí být stejné jako ID aktuálního harmonogramu"
                  : "Cílové ID nesmí obsahovat speciální znaky, pouze číslice a písmena bez diakritiky, podtržítka a pomlčky"}
            </Form.Control.Feedback>
          </Col>
          <Col sm="7" className="mb-2">
            <Button type="submit" disabled={!user || !destValid}>
              <i className="fa fa-clone"></i> Vytvořit kopii
            </Button>
            <i className="fa fa-flask ms-3" aria-hidden="true"></i>{" "}
            <small>Experimentální funkce</small>
          </Col>
        </Row>
      </Form>
    </>
  );
}
