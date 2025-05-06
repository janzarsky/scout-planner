import { level } from "@scout-planner/common/level";

export class Client {
  constructor(table, db) {
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

    this.db = db;
    this.table = table;
  }

  async getPublicLevel() {
    return await this.db
      .doc(`timetables/${this.table}`)
      .get()
      .then(
        (table) =>
          table.exists && typeof table.data().publicLevel === "number"
            ? table.data().publicLevel
            : level.ADMIN,
        () => level.NONE,
      );
  }

  async setPublicLevel(level) {
    try {
      const timetableDoc = this.db.doc(`timetables/${this.table}`);
      const snapshot = await timetableDoc.get();

      if (snapshot.exists) await timetableDoc.update({ publicLevel: level });
      else await timetableDoc.set({ publicLevel: level });

      return level;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getTimetable() {
    try {
      const snapshot = await this.db.doc(`timetables/${this.table}`).get();
      return snapshot.data();
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateTimetable(data) {
    try {
      const timetableDoc = this.db.doc(`timetables/${this.table}`);
      const snapshot = await timetableDoc.get();

      if (snapshot.exists) await timetableDoc.update(data);
      else await timetableDoc.set(data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async get(coll, id) {
    try {
      const snapshot = await this.db
        .doc(`timetables/${this.table}/${coll}/${id}`)
        .get();
      return { ...snapshot.data(), _id: snapshot.id };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAll(coll) {
    try {
      const q = this.db.collection(`timetables/${this.table}/${coll}`);
      const snapshot = await q.get();
      return snapshot.docs.map((doc) => ({
        ...doc.data(),
        _id: doc.id,
      }));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async post(coll, data) {
    try {
      const docRef = await this.db
        .collection(`timetables/${this.table}/${coll}`)
        .add(data);
      return { ...data, _id: docRef.id };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async put(coll, data) {
    try {
      await this.db
        .doc(`timetables/${this.table}/${coll}/${data._id}`)
        .set(data);

      return data;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async remove(coll, id) {
    try {
      await this.db.doc(`timetables/${this.table}/${coll}/${id}`).delete();
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
