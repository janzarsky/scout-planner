import React, { useCallback, useState } from "react";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

export default function Homepage() {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const submit = useCallback(() => navigate(`/${state}`), [navigate, state]);
  const valid = state.match(/^[\w-]+$/);

  const random = useCallback(
    () => navigate(`/${Math.floor(Math.random() * 10e13).toString(16)}`),
    [navigate],
  );

  return (
    <div className="mt-4 p-5">
      <div className="container">
        <h1 className="mb-5">Skautský plánovač</h1>

        <InputGroup className="mb-4">
          <Form.Control
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Kód"
          />
          <Button disabled={!valid} variant="primary" onClick={submit}>
            Otevřít
          </Button>
        </InputGroup>

        <Button variant="primary" onClick={random}>
          Nový harmonogram
        </Button>
      </div>
    </div>
  );
}
