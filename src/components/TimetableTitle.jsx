import React from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import {
  useGetTimetableQuery,
  useUpdateTitleMutation,
} from "../store/timetableApi";

export function TimetableTitle() {
  const { table } = useSelector((state) => state.auth);
  const { data: timetable } = useGetTimetableQuery(table);
  const [updateTitle] = useUpdateTitleMutation();

  const [title, setTitle] = useState(timetable.title ? timetable.title : "");
  const [editing, setEditing] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (editing) {
      updateTitle({ table, data: title ? title : null });
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
              {timetable.title ? timetable.title : "(bez názvu)"}
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
