/**
 * @file Entrypoint
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import {BrowserRouter, Route, Switch, Redirect, useParams} from 'react-router-dom';

function AppWrapper(props) {
  let { table } = useParams();
  return <App table={table} />
}

ReactDOM.render((
  <BrowserRouter>
    <Switch>
      <Redirect exact from="/" to={"/" + require('crypto').randomBytes(10).toString('hex')} />
      <Route path="/:table">
        <AppWrapper />
      </Route>
    </Switch>
  </BrowserRouter>
), document.getElementById('root'));
