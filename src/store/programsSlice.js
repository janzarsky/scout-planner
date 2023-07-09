import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getPrograms = createAsyncThunk(
  "programs/getPrograms",
  async (client) => await client.getPrograms()
);

export const programsSlice = createSlice({
  name: "programs",
  initialState: {
    programs: [],
    deletedPrograms: [],
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
      state.deletedPrograms.push(
        state.programs.find((p) => p._id === action.payload)
      );
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
        state.programs = [...action.payload].filter((p) => !p.deleted);
        state.deletedPrograms = [...action.payload].filter((p) => p.deleted);
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

export const { addProgram, updateProgram, deleteProgram } =
  programsSlice.actions;

export default programsSlice.reducer;
