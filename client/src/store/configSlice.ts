import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

const defaultConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_PROJECT_ID,
  functionsBaseUrl: import.meta.env.VITE_REACT_APP_FUNCTIONS_BASE_URL,
  timetableLayoutVersionSwitchingEnabled:
    import.meta.env
      .VITE_REACT_APP_TIMETABLE_LAYOUT_VERSION_SWITCHING_ENABLED === "true",
  newTray: import.meta.env.VITE_REACT_APP_NEW_TRAY === "true",
  dropIntoBlock: import.meta.env.VITE_REACT_APP_DROP_INTO_BLOCK === "true",
  cloneFeature: import.meta.env.VITE_REACT_APP_CLONE_FEATURE === "true",
};

type Config = typeof defaultConfig;

export const configSlice = createSlice({
  name: "config",
  initialState: { ...defaultConfig },
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
