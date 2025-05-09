import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const cloneApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "cloneApi",
  endpoints: (builder) => ({
    clone: builder.mutation({
      async queryFn({ source, destination }) {
        console.debug(`Cloning from ${source} to ${destination}`);

        throw new Error("Not implemented");
      },
    }),
  }),
});

export const { useCloneMutation } = cloneApi;
