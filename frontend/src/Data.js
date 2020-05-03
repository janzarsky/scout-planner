/**
 * @file Functions for communicating with backend
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

const config = require('./config.json');

function get(table, path, id) {
  return fetch(`${config.host}/${table}/${path}/${id}`)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    })
}

function getAll(table, path) {
  return fetch(`${config.host}/${table}/${path}`)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    })
    .then(data => new Map(data.map((elem) => [elem._id, elem])));
}

function post(table, path, data) {
  return fetch(`${config.host}/${table}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    });
}

function put(table, path, data) {
  return fetch(`${config.host}/${table}/${path}/${data._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    });
}

function remove(table, path, id) {
  return fetch(`${config.host}/${table}/${path}/${id}`, {
      method: 'DELETE',
    })
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    });
}

var toExport = {};

['program', 'pkg', 'rule'].forEach((entity) => {
  const name = entity.charAt(0).toUpperCase() + entity.slice(1);

  toExport[`get${name}s`] = (table) => getAll(table, `${entity}s`);
  toExport[`get${name}`] = (table, id) => get(table, `${entity}s`, id);
  toExport[`add${name}`] = (table, data) => post(table, `${entity}s`, data);
  toExport[`update${name}`] = (table, data) => put(table, `${entity}s`, data);
  toExport[`delete${name}`] = (table, id) => remove(table, `${entity}s`, id);
});

// TODO
toExport.getGroups = async function() {
  return new Map([
    ['clk1', { name: '1' }],
    ['clk2', { name: '2' }],
    ['clk3', { name: '3' }],
    ['clk4', { name: '4' }],
    ['clk5', { name: '5' }],
    ['clk6', { name: '6' }],
    ['in', { name: 'IN' }],
  ]);
};

export default toExport;
