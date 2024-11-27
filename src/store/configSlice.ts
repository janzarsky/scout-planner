import { createSlice } from "@reduxjs/toolkit";
import localConfig from "../config.local.json";
import { useSelector } from "react-redux";

const defaultConfig = {
  host: "https://harmonogram.zarsky.name/api",
  apiKey: "AIzaSyAJWL29qO2dgvaJvDpnXALUYtH_Lkdrek8",
  authDomain: "scout-planner-343913.firebaseapp.com",
  projectId: "scout-planner-343913",
  streamingUpdates: true,
  streamingUpdatesEnabledPrefixes: ["asdf", "vm24_"],
  timetableLayoutVersionSwitchingEnabled: false,
};

type Config = typeof defaultConfig;

export const configSlice = createSlice({
  name: "config",
  initialState: {
    ...defaultConfig,
    ...localConfig,
  },
  reducers: {
    overrideConfig(state, action: { payload: Partial<Config> }) {
      return { ...state, ...action.payload };
    },
  },
});

export const { overrideConfig } = configSlice.actions;

export default configSlice.reducer;

export function useConfig<T extends keyof Config>(key: T): Config[T] {
  return useSelector((state: { config: Config }) => state.config[key]);
}
