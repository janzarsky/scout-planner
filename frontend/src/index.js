import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./components/App";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";
import { Provider, useDispatch } from "react-redux";
import { getStore } from "./store";
import { setTable } from "./store/authSlice";

function AppWrapper() {
  const dispatch = useDispatch();
  let { table } = useParams();
  dispatch(setTable(table));

  return <App />;
}

const Homepage = () => {
  const navigate = useNavigate();
  const [state, setState] = useState("");
  const submit = useCallback(() => navigate(`/${state}`), [navigate, state]);
  const valid = state.match(/^[\w-]+$/);

  const random = useCallback(
    () => navigate(`/${Math.floor(Math.random() * 10e13).toString(16)}`),
    [navigate]
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
};

const root = createRoot(document.getElementById("root"));
const store = getStore();

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<Homepage />} />
        <Route path="/:table" element={<AppWrapper />} />
      </Routes>
    </BrowserRouter>
  </Provider>
);
