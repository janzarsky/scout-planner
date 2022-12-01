import { configureStore } from "@reduxjs/toolkit";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rangesReducer from "./rangesSlice";
import groupsReducer from "./groupsSlice";
import packagesReducer from "./packagesSlice";
import rulesReducer from "./rulesSlice";

const composedEnhancer = applyMiddleware(thunkMiddleware);

export default configureStore(
  {
    reducer: {
      ranges: rangesReducer,
      groups: groupsReducer,
      packages: packagesReducer,
      rules: rulesReducer,
    },
  },
  composedEnhancer
);
