interface ImportMetaEnv {
  readonly VITE_REACT_APP_API_KEY: string;
  readonly VITE_REACT_APP_AUTH_DOMAIN: string;
  readonly VITE_REACT_APP_PROJECT_ID: string;
  readonly VITE_REACT_APP_TIMETABLE_LAYOUT_VERSION_SWITCHING_ENABLED: string;
  readonly VITE_REACT_APP_NEW_TRAY: string;
  readonly VITE_REACT_APP_DROP_INTO_BLOCK: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
