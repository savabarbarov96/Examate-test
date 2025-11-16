/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_MONGO_URI: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }