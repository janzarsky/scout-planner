import { getAuth } from "firebase/auth";

const config = require("./config.json");

export default class Client {
  constructor(timetable) {
    [
      ["programs", "Program", "Programs"],
      ["packages", "Package", "Packages"],
      ["rules", "Rule", "Rules"],
      ["groups", "Group", "Groups"],
      ["ranges", "Range", "Ranges"],
      ["users", "User", "Users"],
      ["people", "Person", "People"],
    ].forEach(([path, nameSingular, namePlural]) => {
      this[`get${namePlural}`] = () => this.getAll(path);
      this[`get${nameSingular}`] = (id) => this.get(path, id);
      this[`add${nameSingular}`] = (data) => this.post(path, data);
      this[`update${nameSingular}`] = (data) => this.put(path, data);
      this[`delete${nameSingular}`] = (id) => this.remove(path, id);
    });

    this.basePath = `${config.host}/${timetable}`;
  }

  async getAuthHeader() {
    const auth = getAuth();
    const token =
      auth && auth.currentUser ? await auth.currentUser.getIdToken() : null;
    return token ? { Authorization: token } : {};
  }

  async updateSettings(data) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error(`Během aktualizace nastavení nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Během aktualizace nastavení nastala chyba.`);
    }
    return;
  }

  async getSettings() {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/settings`, {
        method: "GET",
        headers: await this.getAuthHeader(),
      });
    } catch {
      throw new Error(`Při načítání nastavení nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Při načítání nastavení nastala chyba.`);
    }
    return await resp.json();
  }

  async getPermissions() {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/permissions`, {
        method: "GET",
        headers: await this.getAuthHeader(),
      });
    } catch {
      throw new Error(`Při načítání uživatelských oprávnění nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Při načítání uživatelských oprávnění nastala chyba.`);
    }
    return await resp.json();
  }

  async get(path, id) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/${path}/${id}`, {
        method: "GET",
        headers: await this.getAuthHeader(),
      });
    } catch {
      throw new Error(`Při načítání nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Při načítání nastala chyba.`);
    }
    return await resp.json();
  }

  async getAll(path) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/${path}`, {
        method: "GET",
        headers: await this.getAuthHeader(),
      });
    } catch {
      throw new Error(`Při načítání nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Při načítání nastala chyba.`);
    }
    return await resp.json();
  }

  async post(path, data) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error(`Během aktualizace nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Během aktualizace nastala chyba.`);
    }
    return await resp.json();
  }

  async put(path, data) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/${path}/${data._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(await this.getAuthHeader()),
        },
        body: JSON.stringify(data),
      });
    } catch {
      throw new Error(`Během přidávání nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Během přidávání nastala chyba.`);
    }
    return await resp.json();
  }

  async remove(path, id) {
    let resp;
    try {
      resp = await fetch(`${this.basePath}/${path}/${id}`, {
        method: "DELETE",
        headers: await this.getAuthHeader(),
      });
    } catch {
      throw new Error(`Během odstraňování nastala chyba.`);
    }
    if (!resp.ok) {
      throw new Error(`Během odstraňování nastala chyba.`);
    }
    return await resp.json();
  }
}
