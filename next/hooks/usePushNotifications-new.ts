'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  checkPushSubscriptionStatus, 
  storePushSubscription, 
  removePushSubscription 
} from '@/app/actions/push-notifications'
import { supabase } from '@/lib/supabase'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean|undefined>(false)
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

  // Check subscription status when user changes
  useEffect(() => {
    if (userId && isSupported) {
      checkSubscriptionStatus()
    }
  }, [userId, isSupported])

  const registerServiceWorker = async () => {
    try {
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
    } catch (error) {
      console.error('Service worker registration failed:', error)
      setError('Failed to register service worker')
    }
  }

  const checkSubscriptionStatus = async () => {
    if (!userId) return

    try {
      const result = await checkPushSubscriptionStatus(userId)
      if (result.success) {
        setIsSubscribed(result.isSubscribed)
      } else {
        setError(result.error || 'Failed to check subscription status')
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
      setError('Failed to check subscription status')
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
      // Request notification permission first
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Notification permission denied')
        return false
      }

      const registration = await navigator.serviceWorker.ready
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ) as BufferSource,
      })

      // Serialize the PushSubscription for server action
      const serializedSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')!))) : '',
          auth: sub.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')!))) : ''
        }
      }

      const result = await storePushSubscription(serializedSubscription, userId)
      
      if (result.success) {
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
      // Unsubscribe from browser
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      
      if (subscription) {
        await subscription.unsubscribe()
      }

      // Remove from database
      const result = await removePushSubscription(userId)
      
      if (result.success) {
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
  }, [userId])

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
