import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getTimetable = createAsyncThunk(
  "timetable/getTimetable",
  async (client) => ({
    title: null,
    ...(await client.getTimetable()),
  }),
);

export const timetableSlice = createSlice({
  name: "timetable",
  initialState: {
    timetable: { title: null },
    loading: "idle",
    error: null,
    loaded: false,
  },
  reducers: {
    updateTitle(state, action) {
      state.timetable.title = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getTimetable.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getTimetable.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.timetable = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getTimetable.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { updateTitle } = timetableSlice.actions;

export default timetableSlice.reducer;
