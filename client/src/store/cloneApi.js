import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cloneApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_APP_FUNCTIONS_BASE_URL,
  }),
  reducerPath: "cloneApi",
  endpoints: (builder) => ({
    clone: builder.mutation({
      query: ({ source, destination, token }) => ({
        url: `/clone-timetable`,
        params: { source, destination },
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
      transformErrorResponse: (response) => ({
        message: response.data?.message,
      }),
    }),
  }),
});

export const { useCloneMutation } = cloneApi;
