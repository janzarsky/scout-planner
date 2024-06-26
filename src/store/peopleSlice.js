import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSliceHook } from "./sliceHelper";

const getPeople = createAsyncThunk(
  "people/getPeople",
  async (client) => await client.getPeople(),
);

const peopleSlice = createSlice({
  name: "people",
  initialState: {
    people: [],
    loading: "idle",
    error: null,
    loaded: false,
  },
  reducers: {
    addPerson(state, action) {
      state.people.push(action.payload);
    },
    updatePerson(state, action) {
      state.people = [
        ...state.people.filter((p) => p._id !== action.payload._id),
        action.payload,
      ];
    },
    deletePerson(state, action) {
      state.people = state.people.filter((p) => p._id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder.addCase(getPeople.pending, (state) => {
      if (state.loading === "idle") {
        state.loading = "pending";
      }
    });

    builder.addCase(getPeople.fulfilled, (state, action) => {
      if (state.loading === "pending") {
        state.people = action.payload;
        state.loading = "idle";
        state.loaded = true;
      }
    });

    builder.addCase(getPeople.rejected, (state) => {
      if (state.loading === "pending") {
        state.loading = "idle";
        state.error = "Error";
      }
    });
  },
});

export const useGetPeopleSlice = createSliceHook("people", getPeople);

export const { addPerson, updatePerson, deletePerson } = peopleSlice.actions;

export default peopleSlice.reducer;
