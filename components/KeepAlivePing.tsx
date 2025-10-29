'use client'

import { useEffect } from 'react'

const STORAGE_KEY = 'supabaseKeepAliveLastPing'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function KeepAlivePing() {
  useEffect(() => {
    try {
      const lastPingIso = localStorage.getItem(STORAGE_KEY)
      const lastPing = lastPingIso ? new Date(lastPingIso).getTime() : 0
      const now = Date.now()

      if (!lastPing || now - lastPing > ONE_WEEK_MS) {
        fetch('/api/health/keepalive', { cache: 'no-store', method: 'GET' })
          .catch(() => {})
          .finally(() => {
            try {
              localStorage.setItem(STORAGE_KEY, new Date().toISOString())
            } catch {}
          })
      }
    } catch {}
  }, [])

  return null
}


