const config = require("./config.json");

export default class Client {
  constructor(timetable) {
    ["program", "package", "rule", "group", "range", "user"].forEach(
      (entity) => {
        const name = entity.charAt(0).toUpperCase() + entity.slice(1);

        this[`get${name}s`] = () => this.#getAll(`${entity}s`);
        this[`get${name}`] = (id) => this.#get(`${entity}s`, id);
        this[`add${name}`] = (data) => this.#post(`${entity}s`, data);
        this[`update${name}`] = (data) => this.#put(`${entity}s`, data);
        this[`delete${name}`] = (id) => this.#remove(`${entity}s`, id);
      }
    );

    this.basePath = `${config.host}/${timetable}`;
  }

  async #get(path, id) {
    const resp = await fetch(`${this.basePath}/${path}/${id}`);
    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }
    return await resp.json();
  }

  async #getAll(path) {
    const resp = await fetch(`${this.basePath}/${path}`);
    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }
    return await resp.json();
  }

  async #post(path, data) {
    const resp = await fetch(`${this.basePath}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }
    return await resp.json();
  }

  async #put(path, data) {
    const resp = await fetch(`${this.basePath}/${path}/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }
    return await resp.json();
  }

  async #remove(path, id) {
    const resp = await fetch(`${this.basePath}/${path}/${id}`, {
      method: "DELETE",
    });
    if (!resp.ok) {
      throw new Error(`HTTP error: ${resp.status}`);
    }
    return await resp.json();
  }
}
