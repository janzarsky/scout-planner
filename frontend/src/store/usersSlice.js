import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const getUsers = createAsyncThunk(
  "users/getUsers",
  async (client) => await client.getUsers()
);

export const usersSlice = createSlice({
  name: "users",
  initialState: { users: [], loading: "idle", error: null },
  reducers: {
    addUser: (state, action) => {
      state.users.push(action.payload);
    },
    updateUser: (state, action) => {
      state.users = [
        ...state.users.filter((r) => r._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((r) => r._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUsers.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getUsers.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.users = action.payload;
        state.loading = "idle";
      }
    });

    builder.addCase(getUsers.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const { addUser, updateUser, deleteUser } = usersSlice.actions;

export default usersSlice.reducer;
