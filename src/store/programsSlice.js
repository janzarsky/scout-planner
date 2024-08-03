import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { firestoreClientFactory } from "../FirestoreClient";
import { useEffect } from "react";

export const getPrograms = createAsyncThunk(
  "programs/getPrograms",
  async (client) => await client.getPrograms(),
);

export const programsSlice = createSlice({
  name: "programs",
  initialState: {
    programs: [],
    loading: "idle",
    error: null,
    loaded: false,
  },
  reducers: {
    addProgram(state, action) {
      state.programs.push(action.payload);
    },
    updateProgram(state, action) {
      state.programs = [
        ...state.programs.filter((p) => p._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteProgram(state, action) {
      state.programs = state.programs.filter((p) => p._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getPrograms.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getPrograms.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        // data fix: previously, deleted programs were stored, now we pretend they do not exist
        state.programs = [...action.payload].filter((p) => !p.deleted);
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getPrograms.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export function useGetProgramsSlice(table) {
  const dispatch = useDispatch();
  const {
    loading: status,
    programs: data,
    error,
    loaded,
  } = useSelector((state) => state.programs);

  useEffect(() => {
    if (status === "idle" && !loaded && table !== undefined) {
      const client = firestoreClientFactory.getClient(table);
      dispatch(getPrograms(client));
    }
  }, [status, table, dispatch]);

  const isUninitialized = status === "idle" && !loaded;
  const isLoading = status === "pending" || status === undefined;
  const isError = status === "idle" && error !== null;
  const isSuccess = status === "idle" && loaded;

  return { data, isUninitialized, isLoading, isError, isSuccess };
}

export function useGetProgramSlice({ table, id }) {
  const dispatch = useDispatch();
  const {
    loading: status,
    programs,
    error,
    loaded,
  } = useSelector((state) => state.programs);

  useEffect(() => {
    if (status === "idle" && !loaded && table !== undefined) {
      const client = firestoreClientFactory.getClient(table);
      dispatch(getPrograms(client));
    }
  }, [status, table, dispatch]);

  const data = programs ? programs.find((p) => p._id === id) : null;

  const isUninitialized = status === "idle" && !loaded;
  const isLoading = status === "pending" || status === undefined;
  const isError = status === "idle" && (error !== null || !data);
  const isSuccess = status === "idle" && loaded && !!data;

  return { data, isUninitialized, isLoading, isError, isSuccess };
}

export const { addProgram, updateProgram, deleteProgram } =
  programsSlice.actions;

export default programsSlice.reducer;
