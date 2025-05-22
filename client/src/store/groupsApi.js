import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const groupsApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "groupsApi",
  tagTypes: ["groups"],
  endpoints: (builder) => ({
    getGroups: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getGroups();
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
        const unsubscribe = client.streamGroups((groups) =>
          updateCachedData(() => groups),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["groups"],
    }),
    addGroup: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.addGroup(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["groups"],
    }),
    updateGroup: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateGroup(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["groups"],
    }),
    deleteGroup: builder.mutation({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.deleteGroup(id);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["groups"],
    }),
  }),
});

export const {
  useGetGroupsQuery,
  useAddGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
} = groupsApi;
