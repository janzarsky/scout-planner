import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSliceHook } from "./sliceHelper";

const getGroups = createAsyncThunk(
  "groups/getGroups",
  async (client) => await client.getGroups(),
);

const groupsSlice = createSlice({
  name: "groups",
  initialState: { groups: [], loading: "idle", error: null, loaded: false },
  reducers: {
    addGroup(state, action) {
      state.groups.push(action.payload);
    },
    updateGroup(state, action) {
      state.groups = [
        ...state.groups.filter((g) => g._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteGroup(state, action) {
      state.groups = state.groups.filter((g) => g._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getGroups.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getGroups.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.groups = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getGroups.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const useGetGroupsSlice = createSliceHook("groups", getGroups);

export const { addGroup, updateGroup, deleteGroup } = groupsSlice.actions;

export default groupsSlice.reducer;
