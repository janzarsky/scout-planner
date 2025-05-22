import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const publicLevelApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "publicLevelApi",
  tagTypes: ["publicLevel"],
  endpoints: (builder) => ({
    getPublicLevel: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getPublicLevel();
          return { data };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      async onCacheEntryAdded(
        table,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        await cacheDataLoaded;

        const client = firestoreClientFactory.getClient(table);
        const unsubscribe = client.streamPublicLevel((level) =>
          updateCachedData(() => level),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["publicLevel"],
    }),
    setPublicLevel: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.setPublicLevel(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["publicLevel"],
    }),
  }),
});

export const { useGetPublicLevelQuery, useSetPublicLevelMutation } =
  publicLevelApi;
