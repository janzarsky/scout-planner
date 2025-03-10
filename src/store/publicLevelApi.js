import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const publicLevelApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "publicLevelApi",
  tagTypes: ["publicLevel"],
  endpoints: (builder) => ({
    getPublicLevel: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getPublicLevel();
        return { data };
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
        const client = firestoreClientFactory.getClient(table);
        await client.setPublicLevel(data);
        return { data: null };
      },
      invalidatesTags: ["publicLevel"],
    }),
  }),
});

export const { useGetPublicLevelQuery, useSetPublicLevelMutation } =
  publicLevelApi;
