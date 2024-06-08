import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";
import config from "../config.json";
import localConfig from "../config.local.json";

const rtkQuery = { ...config, ...localConfig }.rtkQuery;

export const rangesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rangesApi",
  tagTypes: ["ranges"],
  endpoints: (builder) => ({
    getRanges: builder.query({
      queryFn: async (table) => {
        if (!rtkQuery) return {};

        const client = firestoreClientFactory.getClient(table);
        const data = await client.getRanges();
        return { data };
      },
      providesTags: ["ranges"],
    }),
    addRange: builder.mutation({
      queryFn: async ({ table, data }) => {
        if (!rtkQuery) return {};
        const client = firestoreClientFactory.getClient(table);
        await client.addRange(data);
        return {};
      },
      invalidatesTags: ["ranges"],
    }),
  }),
});

export const { useGetRangesQuery, useAddRangeMutation } = rangesApi;
