const config = require("./config.json");

export default class Client {
  constructor(token, timetable) {
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
    this.authHeader = token ? { Authorization: token } : {};
  }

  async updateSettings(data) {
    const resp = await fetch(`${this.basePath}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...this.authHeader },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error(`Během aktualizace nastavení nastala chyba.`);
    }
    return await resp.json();
  }

  async getSettings() {
    const resp = await fetch(`${this.basePath}/settings`, {
      method: "GET",
      headers: this.authHeader,
    });
    if (!resp.ok) {
      throw new Error(`Při načítání nastavení nastala chyba.`);
    }
    return await resp.json();
  }

  async getPermissions() {
    const resp = await fetch(`${this.basePath}/permissions`, {
      method: "GET",
      headers: this.authHeader,
    });
    if (!resp.ok) {
      throw new Error(`Při načítání uživatelských oprávnění nastala chyba.`);
    }
    return await resp.json();
  }

  async #get(path, id) {
    const resp = await fetch(`${this.basePath}/${path}/${id}`, {
      method: "GET",
      headers: this.authHeader,
    });
    if (!resp.ok) {
      throw new Error(`Při načítání nastala chyba.`);
    }
    return await resp.json();
  }

  async #getAll(path) {
    const resp = await fetch(`${this.basePath}/${path}`, {
      method: "GET",
      headers: this.authHeader,
    });
    if (!resp.ok) {
      throw new Error(`Při načítání nastala chyba.`);
    }
    return await resp.json();
  }

  async #post(path, data) {
    const resp = await fetch(`${this.basePath}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...this.authHeader },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error(`Během aktualizace nastala chyba.`);
    }
    return await resp.json();
  }

  async #put(path, data) {
    const resp = await fetch(`${this.basePath}/${path}/${data._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...this.authHeader },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      throw new Error(`Během přidávání nastala chyba.`);
    }
    return await resp.json();
  }

  async #remove(path, id) {
    const resp = await fetch(`${this.basePath}/${path}/${id}`, {
      method: "DELETE",
      headers: this.authHeader,
    });
    if (!resp.ok) {
      throw new Error(`Během odstraňování nastala chyba.`);
    }
    return await resp.json();
  }
}
