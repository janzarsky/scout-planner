import { Client } from "./Client";

export const firestoreClientFactory = {
  getClient() {
    return new Client(...arguments);
  },
};
