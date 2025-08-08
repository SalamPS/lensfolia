'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribeUser, unsubscribeUser } from '@/app/actions/push-notifications'
import { supabase } from '@/lib/supabase'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getCurrentUser()

    const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUserId(session.user.id)
        } else {
          setUserId(null)
          setSubscription(null)
          setIsSubscribed(false)
        }
      }
    )

    return () => {
      authListener.unsubscribe()
    }
  }, [])

  // Check support and register service worker
  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        setIsSupported(true)
        await registerServiceWorker()
      } else {
        setIsSupported(false)
      }
    }
    
    checkSupport()
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        setSubscription(sub)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Service worker registration failed:', error)
      setError('Failed to register service worker')
    }
  }

  const subscribeToPush = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      
      const vapidKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource,
      })

      // Serialize the PushSubscription for server action
      const serializedSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))) : '',
          auth: sub.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))) : ''
        }
      }

      const result = await subscribeUser(serializedSubscription, userId)
      
      if (result.success) {
        setSubscription(sub)
        setIsSubscribed(true)
        return true
      } else {
        setError(result.error || 'Failed to subscribe')
        return false
      }
    } catch (error) {
      console.error('Push subscription failed:', error)
      setError('Failed to subscribe to push notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  const unsubscribeFromPush = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      if (subscription) {
        await subscription.unsubscribe()
      }

      const result = await unsubscribeUser(userId)
      
      if (result.success) {
        setSubscription(null)
        setIsSubscribed(false)
        return true
      } else {
        setError(result.error || 'Failed to unsubscribe')
        return false
      }
    } catch (error) {
      console.error('Push unsubscription failed:', error)
      setError('Failed to unsubscribe from push notifications')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [subscription, userId])

  return {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    userId
  }
}
