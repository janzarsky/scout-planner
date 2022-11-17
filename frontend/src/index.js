import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./components/App";
import {
  BrowserRouter,
  Route,
  Switch,
  useParams,
  useHistory,
} from "react-router-dom";
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

function AppWrapper(props) {
  let { table } = useParams();
  return <App table={table} />;
}

const Homepage = () => {
  const history = useHistory();
  const [state, setState] = React.useState("");
  const submit = React.useCallback(() => {
    history.push(`/${state}`);
  }, [history, state]);
  const valid = state.match(/^[\w-]+$/);

  const random = React.useCallback(() => {
    history.push(`/${Math.floor(Math.random() * 10e13).toString(16)}`);
  }, [history]);

  return (
    <Jumbotron className="text-center min-vh-100">
      <div className="container">
        <h1 className="mb-5">Skautský plánovač</h1>

        <InputGroup className="mb-4">
          <Form.Control
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Kód"
          />
          <InputGroup.Append>
            <Button disabled={!valid} variant="primary" onClick={submit}>
              Otevřít
            </Button>
          </InputGroup.Append>
        </InputGroup>

        <Button variant="primary" onClick={random}>
          Nový harmonogram
        </Button>
      </div>
    </Jumbotron>
  );
};

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Switch>
      <Route path="/" exact>
        <Homepage />
      </Route>
      <Route path="/:table">
        <AppWrapper />
      </Route>
    </Switch>
  </BrowserRouter>
);
