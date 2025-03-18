import { Client } from "./Client";

export const firestoreClientFactory = {
  getClient(table) {
    return new Client(table);
  },
};
