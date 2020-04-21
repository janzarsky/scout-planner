/**
 * @file Functions for communicating with backend
 * @author Jan Zarsky <xzarsk03@fit.vutbr.cz>
 */

const config = require('./config.json');

function get(path, id) {
  return fetch(`${config.host}${path}/${id}`)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    })
}

function getAll(path) {
  return fetch(`${config.host}${path}`)
    .then(resp => {
      if (!resp.ok) {
        throw new Error(`HTTP error: ${resp.status}`);
      }
      return resp.json();
    })
    .then(data => new Map(data.map((elem) => [elem._id, elem])));
}

function post(path, data) {
  return fetch(`${config.host}${path}`, {
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

function put(path, data) {
  return fetch(`${config.host}${path}/${data._id}`, {
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

function remove(path, id) {
  return fetch(`${config.host}${path}/${id}`, {
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

  toExport[`get${name}s`] = () => getAll(`/${entity}s`);
  toExport[`get${name}`] = (id) => get(`/${entity}s`, id);
  toExport[`add${name}`] = (data) => post(`/${entity}s`, data);
  toExport[`update${name}`] = (data) => put(`/${entity}s`, data);
  toExport[`delete${name}`] = (id) => remove(`/${entity}s`, id);
});

// TODO
toExport.getGroups = async function() {
  return new Map([
    ['clk1', { name: 'ČLK 1' }],
    ['clk2', { name: 'ČLK 2' }],
    ['clk3', { name: 'ČLK 3' }],
    ['clk4', { name: 'ČLK 4' }],
    ['clk5', { name: 'ČLK 5' }],
    ['clk6', { name: 'ČLK 6' }],
    ['in', { name: 'IN' }],
  ]);
};

export default toExport;
