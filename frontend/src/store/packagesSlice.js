import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getPackages = createAsyncThunk(
  "packages/getPackages",
  async (client) => await client.getPackages()
);

export const packagesSlice = createSlice({
  name: "packages",
  initialState: { packages: [], loading: "idle", error: null, loaded: false },
  reducers: {
    addPackage: (state, action) => {
      state.packages.push(action.payload);
    },
    updatePackage: (state, action) => {
      state.packages = [
        ...state.packages.filter((p) => p._id !== action.payload._id),
        action.payload,
      ];
    },
    deletePackage: (state, action) => {
      state.packages = state.packages.filter((p) => p._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPackages.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getPackages.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.packages = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getPackages.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { addPackage, updatePackage, deletePackage } =
  packagesSlice.actions;

export default packagesSlice.reducer;
