import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

function addDefaults(data) {
  return {
    title: null,
    layoutVersion: "v1",
    ...data,
  };
}

export const timetableApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "timetableApi",
  tagTypes: ["timetable"],
  endpoints: (builder) => ({
    getTimetable: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          return { data: addDefaults(await client.getTimetable()) };
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
        const unsubscribe = client.streamTimetable((timetable) =>
          updateCachedData(() => addDefaults(timetable)),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["timetable"],
    }),
    updateTitle: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateTimetable({ title: data });
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["timetable"],
    }),
    updateLayoutVersion: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateTimetable({ layoutVersion: data });
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["timetable"],
    }),
  }),
});

export const {
  useGetTimetableQuery,
  useUpdateTitleMutation,
  useUpdateLayoutVersionMutation,
} = timetableApi;
