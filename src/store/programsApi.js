import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const programsApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "programsApi",
  tagTypes: ["programs"],
  endpoints: (builder) => ({
    getProgram: builder.query({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getProgram(id);

        // data fix
        if (data.deleted) return { error: "Program deleted" };

        return { data: data };
      },
      providesTags: ["programs"],
    }),
    getPrograms: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getPrograms();
        // data fix
        return { data: data.filter((p) => !p.deleted) };
      },
      providesTags: ["programs"],
    }),
    addProgram: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addProgram(data);
        return { data: null };
      },
      invalidatesTags: ["programs"],
    }),
    updateProgram: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updateProgram(data);
        return { data: null };
      },
      invalidatesTags: ["programs"],
    }),
    deleteProgram: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deleteProgram(id);
        return { data: null };
      },
      invalidatesTags: ["programs"],
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
