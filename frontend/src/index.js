/**
 * @file Entrypoint
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import {BrowserRouter, Route, Switch, Redirect, useParams, useHistory} from 'react-router-dom';
import Jumbotron from "react-bootstrap/Jumbotron";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

function AppWrapper(props) {
  let { table } = useParams();
  return <App table={table} />
}

const Homepage = () => {
    const history = useHistory()
    const [state, setState] = React.useState('');
    const submit = React.useCallback(() => {
        history.push(`/${state}`)
    }, [history, state])
    const valid = state.match(/^[\w-]+$/)

    return <Jumbotron className="text-center min-vh-100">
        <div class="container">
        <h1 className="mb-5">Skautský plánovač</h1>

        <InputGroup className="mt-3">
            <Form.Control value={state} onChange={e => setState(e.target.value)} placeholder="Kód" />
            <InputGroup.Append>
                <Button disabled={!valid} variant="primary" onClick={submit}>Otevřít</Button>
            </InputGroup.Append>
        </InputGroup>
        </div>

    </Jumbotron>
}

ReactDOM.render((
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
), document.getElementById('root'));
