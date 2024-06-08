import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";
import config from "../config.json";
import localConfig from "../config.local.json";

const rtkQuery = { ...config, ...localConfig }.rtkQuery;

export const rangesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rangesApi",
  endpoints: (builder) => ({
    getRanges: builder.query({
      queryFn: async (table) => {
        if (!rtkQuery) return {};

        const client = firestoreClientFactory.getClient(table);
        const data = await client.getRanges();
        return { data };
      },
    }),
  }),
});

export const { useGetRangesQuery } = rangesApi;
