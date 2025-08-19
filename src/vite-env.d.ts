/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ONECHAIN_RPC_URL: string
  readonly VITE_OCT_COIN_TYPE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
