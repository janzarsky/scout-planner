import { configureStore } from "@reduxjs/toolkit";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rangesReducer from "./rangesSlice";

const composedEnhancer = applyMiddleware(thunkMiddleware);

export default configureStore(
  {
    reducer: {
      ranges: rangesReducer,
    },
  },
  composedEnhancer
);
