import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { level } from "../helpers/Level";

export const getPermissions = createAsyncThunk(
  "auth/getPermissions",
  async (client) => await client.getPermissions()
);

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    table: undefined,
    token: undefined,
    userLevel: level.NONE,
    permissionsLoaded: false,
    loading: "idle",
    error: null,
  },
  reducers: {
    setTable: (state, action) => {
      state.table = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.permissionsLoaded = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getPermissions.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getPermissions.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.userLevel = action.payload.level;
        state.loading = "idle";
        state.permissionsLoaded = true;
      }
    });

    builder.addCase(getPermissions.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { setTable, setToken } = authSlice.actions;

export default authSlice.reducer;
