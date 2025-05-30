import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { level } from "@scout-planner/common/level";

export class Client {
  constructor(table, db, auth) {
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
      this[`stream${namePlural}`] = (callback) =>
        this.streamAll(path, callback);
    });

    this.db = db;
    this.auth = auth;
    this.table = table;
  }

  async getPermissions() {
    try {
      const publicLevel = await getDoc(
        doc(this.db, `timetables/${this.table}`),
      ).then(
        (table) =>
          table.exists() && table.data().publicLevel !== undefined
            ? table.data().publicLevel
            : level.ADMIN,
        () => level.NONE,
      );

      if (this.auth.currentUser) {
        const userLevel = await getDoc(
          doc(
            this.db,
            `timetables/${this.table}/users/${this.auth.currentUser.email}`,
          ),
        ).then(
          (user) =>
            user.exists() && user.data().level !== undefined
              ? user.data().level
              : level.NONE,
          () => level.NONE,
        );

        return { level: userLevel > publicLevel ? userLevel : publicLevel };
      }

      return { level: publicLevel };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getPublicLevel() {
    return await getDoc(doc(this.db, `timetables/${this.table}`)).then(
      (table) =>
        table.exists() && typeof table.data().publicLevel === "number"
          ? table.data().publicLevel
          : level.ADMIN,
      () => level.NONE,
    );
  }

  async setPublicLevel(level) {
    try {
      const timetableDoc = doc(this.db, `timetables/${this.table}`);
      const snapshot = await getDoc(timetableDoc);

      if (snapshot.exists())
        await updateDoc(timetableDoc, {
          publicLevel: level,
        });
      else
        await setDoc(timetableDoc, {
          publicLevel: level,
        });

      return level;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async streamPublicLevel(callback) {
    const q = query(doc(this.db, `timetables/${this.table}`));
    return onSnapshot(q, (table) =>
      callback(
        table.exists() && typeof table.data().publicLevel === "number"
          ? table.data().publicLevel
          : level.ADMIN,
      ),
    );
  }

  async getTimetable() {
    try {
      const snapshot = await getDoc(doc(this.db, `timetables/${this.table}`));
      return snapshot.data();
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async updateTimetable(data) {
    try {
      const timetableDoc = doc(this.db, `timetables/${this.table}`);
      const snapshot = await getDoc(timetableDoc);

      if (snapshot.exists()) await updateDoc(timetableDoc, data);
      else await setDoc(timetableDoc, data);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async streamTimetable(callback) {
    const q = query(doc(this.db, `timetables/${this.table}`));
    return onSnapshot(q, (table) => callback(table.data()));
  }

  async get(coll, id) {
    try {
      const snapshot = await getDoc(
        doc(this.db, `timetables/${this.table}/${coll}/${id}`),
      );
      return { ...snapshot.data(), _id: snapshot.id };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getAll(coll) {
    try {
      const q = query(collection(this.db, `timetables/${this.table}/${coll}`));
      const snapshot = await getDocs(q);
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
      const docRef = await addDoc(
        collection(this.db, `timetables/${this.table}/${coll}`),
        data,
      );

      return { ...data, _id: docRef.id };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async put(coll, data) {
    try {
      await setDoc(
        doc(this.db, `timetables/${this.table}/${coll}/${data._id}`),
        data,
      );

      return data;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async remove(coll, id) {
    try {
      await deleteDoc(doc(this.db, `timetables/${this.table}/${coll}/${id}`));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  streamAll(coll, callback) {
    const q = query(collection(this.db, `timetables/${this.table}/${coll}`));
    return onSnapshot(q, (querySnapshot) =>
      callback(
        querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          _id: doc.id,
        })),
      ),
    );
  }
}
