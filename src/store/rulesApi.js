import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const rulesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rulesApi",
  tagTypes: ["rules"],
  endpoints: (builder) => ({
    getRules: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getRules();
        return { data };
      },
      async onCacheEntryAdded(
        table,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        await cacheDataLoaded;

        const client = firestoreClientFactory.getClient(table);
        const unsubscribe = client.streamRules((rules) =>
          updateCachedData(() => rules),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["rules"],
    }),
    addRule: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addRule(data);
        return { data: null };
      },
      invalidatesTags: ["rules"],
    }),
    deleteRule: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deleteRule(id);
        return { data: null };
      },
      invalidatesTags: ["rules"],
    }),
  }),
});

export const { useGetRulesQuery, useAddRuleMutation, useDeleteRuleMutation } =
  rulesApi;
