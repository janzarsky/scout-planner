import { configureStore } from "@reduxjs/toolkit";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rangesReducer from "./rangesSlice";
import groupsReducer from "./groupsSlice";

const composedEnhancer = applyMiddleware(thunkMiddleware);

export default configureStore(
  {
    reducer: {
      ranges: rangesReducer,
      groups: groupsReducer,
    },
  },
  composedEnhancer
);
