'use client'

import { usePushNotifications } from '@/hooks/usePushNotifications'
import { IconBell, IconBellOff } from '@tabler/icons-react'
import { useState, useEffect } from 'react'

interface PushNotificationToggleProps {
  className?: string
  onToggle?: (isEnabled: boolean) => void
}

export function PushNotificationToggle({ className = '', onToggle }: PushNotificationToggleProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToPush,
    unsubscribeFromPush,
    userId
  } = usePushNotifications()

  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (onToggle) {
      onToggle(isSubscribed)
    }
  }, [isSubscribed, onToggle])

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!userId) {
      return
    }

    if (!isSupported) {
      return
    }

    if (isLoading || isToggling) {
      return
    }

    setIsToggling(true)

    try {
      if (isSubscribed) {
        await unsubscribeFromPush()
      } else {
        // Request notification permission first
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            return
          }
        } else if (Notification.permission === 'denied') {
          alert('Notifications are blocked. Please enable them in your browser settings.')
          return
        }
        
        await subscribeToPush()
      }
    } catch (error) {
      console.error('Error toggling push notifications:', error)
    } finally {
      setIsToggling(false)
    }
  }

  // Don't show if user is not logged in or not supported
  if (!userId || !isSupported) {
    return null
  }

  return (
    <div 
      onClick={handleToggle}
      className={`flex items-center justify-between w-full cursor-pointer hover:bg-accent/50 rounded px-1 py-1 transition-colors ${className} ${(isLoading || isToggling) ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={
        !isSupported 
          ? 'Browser tidak mendukung push notifications'
          : isSubscribed 
            ? 'Klik untuk mematikan notifikasi push'
            : 'Klik untuk mengaktifkan notifikasi push'
      }
    >
      <div className="flex items-center gap-2">
				{isSubscribed ? (
					<IconBell size={16} className="text-primary" />
				) : (
					<IconBellOff size={16} className="text-muted-foreground" />
				)}
        <span className="text-sm">Push Notifications</span>
      </div>
      
      <div className="flex items-center gap-2">
        {(isLoading || isToggling) && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
        )}
        <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
          isSubscribed ? 'bg-primary' : 'bg-muted'
        }`}>
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              isSubscribed ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
      </div>
    </div>
  )
}
