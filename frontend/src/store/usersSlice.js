import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { level } from "../helpers/Level";

export const getUsers = createAsyncThunk("users/getUsers", async (client) => {
  // checking whether the function is present (effectively signals whether firestore flag is on)
  if (client.getPublicLevel) {
    return await Promise.all([client.getUsers(), client.getPublicLevel()]).then(
      ([users, publicLevel]) => ({ users, publicLevel })
    );
  } else {
    return { users: await client.getUsers() };
  }
});

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    publicLevel: level.NONE,
    loading: "idle",
    error: null,
  },
  reducers: {
    addUser(state, action) {
      state.users.push(action.payload);
    },
    updateUser(state, action) {
      state.users = [
        ...state.users.filter((r) => r._id !== action.payload._id),
        action.payload,
      ];
    },
    deleteUser(state, action) {
      state.users = state.users.filter((r) => r._id !== action.payload);
    },
    setPublicLevel(state, action) {
      state.publicLevel = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(getUsers.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getUsers.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.users = action.payload.users;
        if (action.payload.publicLevel !== undefined)
          state.publicLevel = action.payload.publicLevel;
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

export const { addUser, updateUser, deleteUser, setPublicLevel } =
  usersSlice.actions;

export default usersSlice.reducer;
