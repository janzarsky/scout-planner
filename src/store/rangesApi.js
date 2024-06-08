import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const rangesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rangesApi",
  endpoints: (builder) => ({
    getRanges: builder.query({
      queryFn: async (table) => {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getRanges();
        return { data };
      },
    }),
  }),
});
