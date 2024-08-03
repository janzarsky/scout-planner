import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";
import { streamingUpdatesEnabled } from "../helpers/StreamingUpdates";

export const usersApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "usersApi",
  tagTypes: ["users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getUsers();
        return { data };
      },
      async onCacheEntryAdded(
        table,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (streamingUpdatesEnabled(table)) {
          await cacheDataLoaded;

          const client = firestoreClientFactory.getClient(table);
          const unsubscribe = client.streamUsers((users) =>
            updateCachedData(() => users),
          );

          await cacheEntryRemoved;
          unsubscribe();
        }
      },
      providesTags: ["users"],
    }),
    addUser: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        // note that update here is on purpose (users are indexed by email)
        await client.updateUser(data);
        return { data: null };
      },
      invalidatesTags: ["users"],
    }),
    updateUser: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updateUser(data);
        return { data: null };
      },
      invalidatesTags: ["users"],
    }),
    deleteUser: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deleteUser(id);
        return { data: null };
      },
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
