import { configureStore } from "@reduxjs/toolkit";
import packagesReducer from "./packagesSlice";
import rulesReducer from "./rulesSlice";
import settingsReducer from "./settingsSlice";
import timetableReducer from "./timetableSlice";
import usersReducer from "./usersSlice";
import publicLevelReducer from "./publicLevelSlice";
import programsReducer from "./programsSlice";
import peopleReducer from "./peopleSlice";
import viewReducer from "./viewSlice";
import authReducer from "./authSlice";
import errorsReducer from "./errorsSlice";
import configReducer from "./configSlice";
import { rangesApi } from "./rangesApi";
import { groupsApi } from "./groupsApi";

export function getStore() {
  return configureStore({
    reducer: {
      packages: packagesReducer,
      rules: rulesReducer,
      settings: settingsReducer,
      timetable: timetableReducer,
      users: usersReducer,
      publicLevel: publicLevelReducer,
      programs: programsReducer,
      people: peopleReducer,
      view: viewReducer,
      auth: authReducer,
      errors: errorsReducer,
      config: configReducer,
      [rangesApi.reducerPath]: rangesApi.reducer,
      [groupsApi.reducerPath]: groupsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(rangesApi.middleware)
        .concat(groupsApi.middleware),
  });
}
