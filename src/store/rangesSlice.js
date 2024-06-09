import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";

export const getRanges = createAsyncThunk(
  "ranges/getRanges",
  async (client) => await client.getRanges(),
);

export const rangesSlice = createSlice({
  name: "ranges",
  initialState: { ranges: [], loading: "idle", error: null, loaded: false },
  reducers: {
    addRange(state, action) {
      state.ranges.push(action.payload);
    },
    updateRange(state, action) {
      state.ranges = [
        ...state.ranges.filter((r) => r._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteRange(state, action) {
      state.ranges = state.ranges.filter((r) => r._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getRanges.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getRanges.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.ranges = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getRanges.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export function useGetRangesSlice(table, rtkQuery) {
  const dispatch = useDispatch();
  const {
    loading: status,
    ranges: data,
    error,
    loaded,
  } = useSelector((state) => state.ranges);

  useEffect(() => {
    if (!rtkQuery && status === "idle" && !loaded && table !== undefined) {
      const client = firestoreClientFactory.getClient(table);
      dispatch(getRanges(client));
    }
  }, [status, table, dispatch]);

  const isUninitialized = status === "idle" && !loaded;
  const isLoading = status === "pending" || status === undefined;
  const isError = status === "idle" && error !== null;
  const isSuccess = status === "idle" && loaded;

  return { data, isUninitialized, isLoading, isError, isSuccess };
}

export const { addRange, updateRange, deleteRange } = rangesSlice.actions;

export default rangesSlice.reducer;
