import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { firestoreClientFactory } from "../FirestoreClient";

export const packagesApi = createApi({
  baseQuery: fakeBaseQuery(),
  reducerPath: "packagesApi",
  tagTypes: ["packages"],
  endpoints: (builder) => ({
    getPackages: builder.query({
      async queryFn(table) {
        const client = firestoreClientFactory.getClient(table);
        const data = await client.getPackages();
        return { data };
      },
      async onCacheEntryAdded(
        table,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        await cacheDataLoaded;

        const client = firestoreClientFactory.getClient(table);
        const unsubscribe = client.streamPackages((packages) =>
          updateCachedData(() => packages),
        );

        await cacheEntryRemoved;
        unsubscribe();
      },
      providesTags: ["packages"],
    }),
    addPackage: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.addPackage(data);
        return { data: null };
      },
      invalidatesTags: ["packages"],
    }),
    updatePackage: builder.mutation({
      async queryFn({ table, data }) {
        const client = firestoreClientFactory.getClient(table);
        await client.updatePackage(data);
        return { data: null };
      },
      invalidatesTags: ["packages"],
    }),
    deletePackage: builder.mutation({
      async queryFn({ table, id }) {
        const client = firestoreClientFactory.getClient(table);
        await client.deletePackage(id);
        return { data: null };
      },
      invalidatesTags: ["packages"],
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useAddPackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packagesApi;
