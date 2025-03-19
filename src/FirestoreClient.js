import { getFirestore } from "firebase/firestore";
import { Client } from "./Client";
import { getAuth } from "firebase/auth";

export const firestoreClientFactory = {
  getClient(table) {
    const db = getFirestore();
    const auth = getAuth();

    return new Client(table, db, auth);
  },
};
