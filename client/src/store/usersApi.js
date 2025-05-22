import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const usersApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "usersApi",
  tagTypes: ["users"],
  endpoints: (builder) => ({
    getUsers: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getUsers();
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
        const unsubscribe = client.streamUsers((users) =>
          updateCachedData(() => users),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["users"],
    }),
    addUser: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          // note that update here is on purpose (users are indexed by email)
          await client.updateUser(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["users"],
    }),
    updateUser: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateUser(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["users"],
    }),
    deleteUser: builder.mutation({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.deleteUser(id);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
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
