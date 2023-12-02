/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_HIVE_URI: string;
    readonly VITE_BACKEND_BASE_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  