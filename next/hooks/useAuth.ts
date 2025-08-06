'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export type anonUser_ = {
  id: string
  anon: boolean
  expired: number
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [anonUser, setAnonUser] = useState<anonUser_ | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        setAnonUser(null)
        sessionStorage.removeItem('user')
      }
      else {
        const anonRaw = sessionStorage.getItem('user')
        let anon: anonUser_
        if (anonRaw) {
          anon = JSON.parse(anonRaw)
        } else {
          anon = {
            id: uuidv4(),
            anon: true,
            expired: new Date().getTime() + 10 * 60 * 1000
          }
          sessionStorage.setItem('user', JSON.stringify(anon))
        }
        setAnonUser(anon)
        setUser(null)
      }
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithProvider = async (provider: 'google' | 'github') => {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Login failed')
      }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
      })
      
      // Supabase client will automatically update the auth state
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    anonUser,
    user,
    loading,
    signInWithProvider,
    signOut,
  }
}
