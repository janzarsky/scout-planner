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
  unauthorized: "Pro vytváření kopií se prosím přihlaste",
  forbidden: "Nemáte přístup k cílovému nebo zdrojovému harmonogramu",
  generic: "Během kopírování nastala chyba",
};

function translateError(response) {
  if (response?.status === 401) return msgs.unauthorized;

  if (response?.status === 403) return msgs.forbidden;

  return msgs.generic;
}

export const { useCloneMutation } = cloneApi;

export const testing = { translateError, msgs };
