import { configureStore } from "@reduxjs/toolkit";
import { applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rangesReducer from "./rangesSlice";
import groupsReducer from "./groupsSlice";
import packagesReducer from "./packagesSlice";
import rulesReducer from "./rulesSlice";
import settingsReducer from "./settingsSlice";
import usersReducer from "./usersSlice";
import programsReducer from "./programsSlice";
import viewReducer from "./viewSlice";
import authReducer from "./authSlice";
import errorsReducer from "./errorsSlice";

const composedEnhancer = applyMiddleware(thunkMiddleware);

export default configureStore(
  {
    reducer: {
      ranges: rangesReducer,
      groups: groupsReducer,
      packages: packagesReducer,
      rules: rulesReducer,
      settings: settingsReducer,
      users: usersReducer,
      programs: programsReducer,
      view: viewReducer,
      auth: authReducer,
      errors: errorsReducer,
    },
  },
  composedEnhancer
);
