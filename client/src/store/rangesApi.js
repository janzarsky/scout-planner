import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const rangesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rangesApi",
  tagTypes: ["ranges"],
  endpoints: (builder) => ({
    getRanges: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getRanges();
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
        const unsubscribe = client.streamRanges((ranges) =>
          updateCachedData(() => ranges),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["ranges"],
    }),
    addRange: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.addRange(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["ranges"],
    }),
    updateRange: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateRange(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["ranges"],
    }),
    deleteRange: builder.mutation({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.deleteRange(id);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["ranges"],
    }),
  }),
});

export const {
  useGetRangesQuery,
  useAddRangeMutation,
  useUpdateRangeMutation,
  useDeleteRangeMutation,
} = rangesApi;
