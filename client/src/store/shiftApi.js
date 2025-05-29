import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shiftApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_APP_FUNCTIONS_BASE_URL,
  }),
  reducerPath: "shiftApi",
  endpoints: (builder) => ({
    shift: builder.mutation({
      query: ({ source, offset, token }) => ({
        url: `/shift-timetable`,
        params: { source, offset },
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
  }),
});

export const { useShiftMutation } = shiftApi;
