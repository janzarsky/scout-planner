import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const shiftApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_REACT_APP_FUNCTIONS_BASE_URL,
  }),
  reducerPath: "shiftApi",
  endpoints: (builder) => ({
    shift: builder.mutation({
      query: ({ table, offset, token }) => ({
        url: `/shift-timetable`,
        params: { table, offset },
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }),
      transformErrorResponse: (response) => ({
        message: translateError(response),
      }),
    }),
  }),
});

const msgs = {
  unauthorized: "Pro posun data se prosím přihlaste",
  forbidden: "Nemáte přístup k cílovému harmonogramu",
  generic: "Během posunu data nastala chyba",
};

function translateError(response) {
  if (response?.status === 401) return msgs.unauthorized;

  if (response?.status === 403) return msgs.forbidden;

  return msgs.generic;
}

export const { useShiftMutation } = shiftApi;
