interface ImportMetaEnv {
  readonly VITE_REACT_APP_API_KEY: string;
  readonly VITE_REACT_APP_AUTH_DOMAIN: string;
  readonly VITE_REACT_APP_PROJECT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
