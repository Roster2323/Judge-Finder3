/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_N8N_BASE_URL?: string
  readonly REACT_APP_COURTLISTENER_TOKEN?: string
  readonly REACT_APP_STRIPE_PUBLISHABLE_KEY?: string
  readonly REACT_APP_SUPABASE_URL?: string
  readonly REACT_APP_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
