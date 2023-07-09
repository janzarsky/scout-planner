import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getRules = createAsyncThunk(
  "rules/getRules",
  async (client) => await client.getRules()
);

export const rulesSlice = createSlice({
  name: "rules",
  initialState: { rules: [], loading: "idle", error: null, loaded: false },
  reducers: {
    addRule(state, action) {
      state.rules.push(action.payload);
    },
    updateRule(state, action) {
      state.rules = [
        ...state.rules.filter((r) => r._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteRule(state, action) {
      state.rules = state.rules.filter((r) => r._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getRules.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getRules.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.rules = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getRules.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { addRule, updateRule, deleteRule } = rulesSlice.actions;

export default rulesSlice.reducer;
