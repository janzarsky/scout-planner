import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateTitle } from "../store/timetableSlice";
import { firestoreClientFactory } from "../FirestoreClient";
import { useState } from "react";
import { addError } from "../store/errorsSlice";
import { Button, Col, Form, Row } from "react-bootstrap";

export function TimetableTitle() {
  const { timetable } = useSelector((state) => state.timetable);
  const dispatch = useDispatch();

  const { table } = useSelector((state) => state.auth);
  const client = firestoreClientFactory.getClient(table);

  const [title, setTitle] = useState(timetable.title ? timetable.title : "");
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      const newTitle = title ? title : null;
      client.updateTimetable({ title: newTitle }).then(
        () => dispatch(updateTitle(newTitle)),
        (e) => dispatch(addError(e.message)),
      );
      setEditing(false);
    } else {
      setEditing(true);
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Row className="mb-3">
        <Form.Label column sm="2">
          Název harmonogramu
        </Form.Label>
        <Col sm="3">
          {editing ? (
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          ) : (
            <Form.Label className="pt-2">
              {title ? title : "(bez názvu)"}
            </Form.Label>
          )}
        </Col>
        <Col>
          {editing ? (
            <Button type="submit">
              <i className="fa fa-check"></i> Uložit
            </Button>
          ) : (
            <Button type="submit">
              <i className="fa fa-pencil"></i> Upravit
            </Button>
          )}
        </Col>
      </Row>
    </Form>
  );
}
