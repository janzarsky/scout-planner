const config = require("./config.json");

async function get(table, path, id) {
  const resp = await fetch(`${config.host}/${table}/${path}/${id}`);
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  return await resp.json();
}

async function getAll(table, path) {
  const resp = await fetch(`${config.host}/${table}/${path}`);
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  return await resp.json();
}

async function getAllLegacy(table, path) {
  const resp = await fetch(`${config.host}/${table}/${path}`);
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  const data = await resp.json();
  return new Map(data.map((elem) => [elem._id, elem]));
}

async function post(table, path, data) {
  const resp = await fetch(`${config.host}/${table}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  return await resp.json();
}

async function put(table, path, data) {
  const resp = await fetch(`${config.host}/${table}/${path}/${data._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  return await resp.json();
}

async function remove(table, path, id) {
  const resp = await fetch(`${config.host}/${table}/${path}/${id}`, {
    method: "DELETE",
  });
  if (!resp.ok) {
    throw new Error(`HTTP error: ${resp.status}`);
  }
  return await resp.json();
}

var toExport = {};

["program", "package", "rule", "group"].forEach((entity) => {
  const name = entity.charAt(0).toUpperCase() + entity.slice(1);

  toExport[`get${name}s`] = (table) => getAllLegacy(table, `${entity}s`);
  toExport[`get${name}`] = (table, id) => get(table, `${entity}s`, id);
  toExport[`add${name}`] = (table, data) => post(table, `${entity}s`, data);
  toExport[`update${name}`] = (table, data) => put(table, `${entity}s`, data);
  toExport[`delete${name}`] = (table, id) => remove(table, `${entity}s`, id);
});

toExport[`getGroups`] = (table) => getAll(table, `groups`);

export default toExport;
