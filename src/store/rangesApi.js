import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const rangesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "rangesApi",
  tagTypes: ["ranges"],
  endpoints: (builder) => ({
    getRanges: builder.query({
      async queryFn(table, rtkQuery) {
        if (!rtkQuery) return {};

        const client = firestoreClientFactory.getClient(table);
        const data = await client.getRanges();
        return { data };
      },
      providesTags: ["ranges"],
    }),
    addRange: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addRange(data);
        return { data: null };
      },
      invalidatesTags: ["ranges"],
    }),
    updateRange: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updateRange(data);
        return { data: null };
      },
      invalidatesTags: ["ranges"],
    }),
    deleteRange: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deleteRange(id);
        return { data: null };
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
