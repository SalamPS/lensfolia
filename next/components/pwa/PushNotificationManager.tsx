'use client'

import { useState } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/button'
import { IconBell, IconBellOff, IconCheck, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface PushNotificationManagerProps {
  className?: string
  showTestButton?: boolean
}

export function PushNotificationManager({ 
  className, 
  showTestButton = false 
}: PushNotificationManagerProps) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribeToPush,
    unsubscribeFromPush,
    userId
  } = usePushNotifications()

  const [testMessage, setTestMessage] = useState('')

  if (!userId) {
    return (
      <div className={cn("text-center p-4", className)}>
        <p className="text-muted-foreground text-sm">
          Silakan login untuk mengaktifkan notifikasi push
        </p>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className={cn("text-center p-4", className)}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <IconX className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold">Tidak Didukung</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          Browser Anda tidak mendukung push notifications
        </p>
      </div>
    )
  }

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribeFromPush()
    } else {
      await subscribeToPush()
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <IconBell className="h-5 w-5 text-primary" />
          ) : (
            <IconBellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <div>
            <h3 className="font-semibold">Push Notifications</h3>
            <p className="text-muted-foreground text-sm">
              {isSubscribed 
                ? "Anda berlangganan notifikasi push" 
                : "Aktifkan notifikasi push untuk update terbaru"
              }
            </p>
          </div>
        </div>
        
        <Button
          variant={isSubscribed ? "outline" : "default"}
          onClick={handleToggleSubscription}
          disabled={isLoading}
          className="min-w-[100px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Loading...</span>
            </div>
          ) : isSubscribed ? (
            <>
              <IconX className="h-4 w-4 mr-1" />
              Matikan
            </>
          ) : (
            <>
              <IconCheck className="h-4 w-4 mr-1" />
              Aktifkan
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconX className="h-4 w-4" />
            <span className="text-sm font-medium">Error</span>
          </div>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {showTestButton && isSubscribed && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Test Notification</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Test message"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // This would need a test API endpoint
                console.log('Test notification:', testMessage)
                setTestMessage('')
              }}
              disabled={!testMessage.trim()}
            >
              Kirim Test
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
