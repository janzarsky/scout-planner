import { level } from "@scout-planner/common/level";

// TODO: unify across functions
export class Client {
  constructor(table, db) {
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
}
