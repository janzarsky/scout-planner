import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const DEFAULT_TIME_STEP = 15 * 60 * 1000;
export const DEFAULT_WIDTH = 100;

function addDefaults(data) {
  return {
    timeStep: DEFAULT_TIME_STEP,
    width: DEFAULT_WIDTH,
    groupLock: false,
    ...(data && data.settings ? data.settings : {}),
  };
}

export const settingsApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "settingsApi",
  tagTypes: ["settings"],
  endpoints: (builder) => ({
    getSettings: builder.query({
      async queryFn(table) {
        try {
          const client = firestoreClientFactory.getClient(table);
          const data = await client.getTimetable();
          return {
            data: addDefaults(data),
          };
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
      providesTags: ["settings"],
    }),
    updateSettings: builder.mutation({
      async queryFn({ table, data }) {
        try {
          const client = firestoreClientFactory.getClient(table);
          await client.updateTimetable({ settings: data });
          return { data: null };
        } catch (e) {
          return { error: { message: e.message } };
        }
      },
      invalidatesTags: ["settings"],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
