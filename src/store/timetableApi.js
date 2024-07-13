import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const timetableApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "timetableApi",
  tagTypes: ["timetable"],
  endpoints: (builder) => ({
    getTimetable: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = {
          title: null,
          ...(await client.getTimetable()),
        };
        return { data };
      },
      providesTags: ["timetable"],
    }),
    updateTitle: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updateTimetable({ title: data });
        return { data: null };
      },
      invalidatesTags: ["timetable"],
    }),
  }),
});

export const { useGetTimetableQuery, useUpdateTitleMutation } = timetableApi;
