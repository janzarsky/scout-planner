import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const peopleApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "peopleApi",
  tagTypes: ["people"],
  endpoints: (builder) => ({
    getPeople: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getPeople();
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
        const unsubscribe = client.streamPeople((people) =>
          updateCachedData(() => people),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["people"],
    }),
    addPerson: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const res = await client.addPerson(data);
          return { data: res._id };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["people"],
    }),
    updatePerson: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updatePerson(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["people"],
    }),
    deletePerson: builder.mutation({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.deletePerson(id);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
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
