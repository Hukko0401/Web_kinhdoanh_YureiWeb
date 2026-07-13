import { createClient } from '@supabase/supabase-js'
import { environment } from '../environments/environment'

const supabaseUrl = environment.supabaseUrl
const supabaseKey = environment.supabaseKey

const REMEMBER_FLAG_KEY = 'yurei_remember_me'

// Custom storage: quyết định lưu localStorage hay sessionStorage
// dựa vào cờ REMEMBER_FLAG_KEY được set TRƯỚC khi login xảy ra
const customStorage = {
  getItem: (key: string) => {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    const remember = localStorage.getItem(REMEMBER_FLAG_KEY) === 'true'
    if (remember) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true
  }
})