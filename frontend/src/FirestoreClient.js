import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
} from "firebase/firestore";

class FirestoreClient {
  constructor(table) {
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

    this.db = getFirestore();
    this.table = table;
  }

  // TODO: get permissions
  // TODO: get/set settings

  async get(coll, id) {
    try {
      const snapshot = await getDoc(
        doc(this.db, `timetables/${this.table}/${coll}/${id}`)
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
        data
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
        data
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
}

export const firestoreClientFactory = {
  getClient() {
    return new FirestoreClient(...arguments);
  },
};
