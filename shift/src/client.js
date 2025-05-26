import { level } from "@scout-planner/common/level";

// TODO: unify across functions
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
    ].forEach(([path, , namePlural]) => {
      this[`get${namePlural}`] = () => this.getAll(path);
    });

    this.db = db;
    this.table = table;
  }

  async getAccessLevel(user) {
    try {
      const publicLevel = await this.db
        .doc(`timetables/${this.table}`)
        .get()
        .then(
          (table) =>
            table.exists && table.data().publicLevel !== undefined
              ? table.data().publicLevel
              : level.ADMIN,
          () => level.NONE,
        );

      if (user) {
        const userLevel = await this.db
          .doc(`timetables/${this.table}/users/${user}`)
          .get()
          .then(
            (user) =>
              user.exists && user.data().level !== undefined
                ? user.data().level
                : level.NONE,
            () => level.NONE,
          );

        return userLevel > publicLevel ? userLevel : publicLevel;
      }

      return publicLevel;
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
}
