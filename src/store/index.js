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
import peopleReducer from "./peopleSlice";
import viewReducer from "./viewSlice";
import authReducer from "./authSlice";
import errorsReducer from "./errorsSlice";
import configReducer from "./configSlice";

const composedEnhancer = applyMiddleware(thunkMiddleware);

export function getStore() {
  return configureStore(
    {
      reducer: {
        ranges: rangesReducer,
        groups: groupsReducer,
        packages: packagesReducer,
        rules: rulesReducer,
        settings: settingsReducer,
        users: usersReducer,
        programs: programsReducer,
        people: peopleReducer,
        view: viewReducer,
        auth: authReducer,
        errors: errorsReducer,
        config: configReducer,
      },
    },
    composedEnhancer
  );
}
