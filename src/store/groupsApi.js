import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const groupsApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "groupsApi",
  tagTypes: ["groups"],
  endpoints: (builder) => ({
    getGroups: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getGroups();
        return { data };
      },
      providesTags: ["groups"],
    }),
    addGroup: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addGroup(data);
        return { data: null };
      },
      invalidatesTags: ["groups"],
    }),
    updateGroup: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updateGroup(data);
        return { data: null };
      },
      invalidatesTags: ["groups"],
    }),
    deleteGroup: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deleteGroup(id);
        return { data: null };
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
