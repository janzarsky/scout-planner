import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const programsApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "programsApi",
  tagTypes: ["program"],
  endpoints: (builder) => ({
    getProgram: builder.query({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getProgram(id);

          // data fix
          if (data.deleted) return { error: "Program deleted" };

          return { data: data };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      providesTags: (program) =>
        program
          ? [
              { type: "program", id: program._id },
              { type: "program", id: "LIST" },
            ]
          : ["program"],
    }),
    getPrograms: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getPrograms();
          // data fix
          return { data: data.filter((p) => !p.deleted) };
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
        const unsubscribe = client.streamPrograms((programs) =>
          updateCachedData(() => programs.filter((p) => !p.deleted)),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: (programs) =>
        programs
          ? [
              ...programs.map(({ _id }) => ({ type: "program", id: _id })),
              { type: "program", id: "LIST" },
            ]
          : ["program"],
    }),
    addProgram: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.addProgram(data);
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: [{ type: "program", id: "LIST" }],
    }),
    updateProgram: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateProgram(data);
          return { data };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: (program) => [
        ...(program ? [{ type: "program", id: program._id }] : []),
        { type: "program", id: "LIST" },
      ],
    }),
    deleteProgram: builder.mutation({
      async queryFn({ table, id }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.deleteProgram(id);
          return { data: id };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: (id) => [
        { type: "program", id },
        { type: "program", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProgramQuery,
  useGetProgramsQuery,
  useAddProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
} = programsApi;
