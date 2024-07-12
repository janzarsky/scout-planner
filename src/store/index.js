import { configureStore } from "@reduxjs/toolkit";
import rulesReducer from "./rulesSlice";
import settingsReducer from "./settingsSlice";
import timetableReducer from "./timetableSlice";
import usersReducer from "./usersSlice";
import programsReducer from "./programsSlice";
import viewReducer from "./viewSlice";
import authReducer from "./authSlice";
import errorsReducer from "./errorsSlice";
import configReducer from "./configSlice";
import { rangesApi } from "./rangesApi";
import { groupsApi } from "./groupsApi";
import { packagesApi } from "./packagesApi";
import { peopleApi } from "./peopleApi";
import { publicLevelApi } from "./publicLevelApi";
import { rulesApi } from "./rulesApi";

export function getStore() {
  return configureStore({
    reducer: {
      rules: rulesReducer,
      settings: settingsReducer,
      timetable: timetableReducer,
      users: usersReducer,
      programs: programsReducer,
      view: viewReducer,
      auth: authReducer,
      errors: errorsReducer,
      config: configReducer,
      [rangesApi.reducerPath]: rangesApi.reducer,
      [groupsApi.reducerPath]: groupsApi.reducer,
      [packagesApi.reducerPath]: packagesApi.reducer,
      [peopleApi.reducerPath]: peopleApi.reducer,
      [publicLevelApi.reducerPath]: publicLevelApi.reducer,
      [rulesApi.reducerPath]: rulesApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(rangesApi.middleware)
        .concat(groupsApi.middleware)
        .concat(packagesApi.middleware)
        .concat(peopleApi.middleware)
        .concat(publicLevelApi.middleware)
        .concat(rulesApi.middleware),
  });
}
