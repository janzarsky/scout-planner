import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const peopleApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "peopleApi",
  tagTypes: ["people"],
  endpoints: (builder) => ({
    getPeople: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getPeople();
        return { data };
      },
      providesTags: ["people"],
    }),
    addPerson: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addPerson(data);
        return { data: null };
      },
      invalidatesTags: ["people"],
    }),
    updatePerson: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updatePerson(data);
        return { data: null };
      },
      invalidatesTags: ["people"],
    }),
    deletePerson: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deletePerson(id);
        return { data: null };
      },
      invalidatesTags: ["people"],
    }),
  }),
});

export const {
  useGetPeopleQuery,
  useAddPersonMutation,
  useUpdatePersonMutation,
  useDeletePersonMutation,
} = peopleApi;