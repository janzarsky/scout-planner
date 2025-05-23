import React, { useCallback, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router";
import {
  generateTimetableId,
  isValidTimetableId,
} from "@scout-planner/common/timetableIdUtils";

export default function Homepage() {
  const navigate = useNavigate();
  const [table, setTable] = useState("");

  const submit = useCallback(() => navigate(`/${table}`), [navigate, table]);

  const random = useCallback(
    () => navigate("/" + generateTimetableId()),
    [navigate],
  );

  return (
    <div className="mt-4 p-5">
      <div className="container">
        <h1 className="mb-5">Skautský plánovač</h1>

        <Form>
          <InputGroup className="mb-4">
            <Form.Control
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="Kód"
              autoFocus={true}
              isValid={table && isValidTimetableId(table)}
              isInvalid={table && !isValidTimetableId(table)}
            />
            <Button
              type="submit"
              disabled={!isValidTimetableId(table)}
              variant="primary"
              onClick={submit}
            >
              Otevřít
            </Button>
          </InputGroup>
        </Form>

        <Button variant="primary" onClick={random}>
          Nový harmonogram
        </Button>
      </div>
    </div>
  );
}
