import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";
import { streamingUpdatesEnabled } from "../helpers/StreamingUpdates";

function addDefaults(data) {
  return { title: null, ...data };
}

export const timetableApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "timetableApi",
  tagTypes: ["timetable"],
  endpoints: (builder) => ({
    getTimetable: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        return { data: addDefaults(await client.getTimetable()) };
      },
      async onCacheEntryAdded(
        table,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        if (streamingUpdatesEnabled(table)) {
          await cacheDataLoaded;

          const client = firestoreClientFactory.getClient(table);
          const unsubscribe = client.streamTimetable((timetable) =>
            updateCachedData(() => addDefaults(timetable)),
          );

          await cacheEntryRemoved;
          unsubscribe();
        }
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
