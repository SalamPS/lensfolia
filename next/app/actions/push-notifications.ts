'use server'

import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

// Create service role client for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure web-push
webpush.setVapidDetails(
  'mailto:salamp.arta@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export interface SerializedPushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// Server action to check subscription status
export async function checkPushSubscriptionStatus(userId: string) {
  try {
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking subscription status:', error)
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      isSubscribed: !!subscription,
      subscription: subscription || null
    }
  } catch (error) {
    console.error('Error in checkPushSubscriptionStatus:', error)
    return { success: false, error: 'Failed to check subscription status' }
  }
}

// Server action to store push subscription
export async function storePushSubscription(
  subscription: SerializedPushSubscription, 
  userId: string
) {
  try {
    // Try with the expected structure first
    let { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        created_at: new Date().toISOString()
      })

    // If auth column doesn't exist, try with different structure
    if (error && error.message.includes("'auth'")) {
      console.log('Trying alternative column structure...')
      const result = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth_key: subscription.keys.auth, // Try auth_key instead
          created_at: new Date().toISOString()
        })
      error = result.error
    }

    if (error) {
      console.error('Error storing subscription:', error)
      return { success: false, error: `Database error: ${error.message}. Please check table structure.` }
    }

    return { success: true, message: 'Subscription stored successfully' }
  } catch (error) {
    console.error('Error in storePushSubscription:', error)
    return { success: false, error: 'Failed to store subscription' }
  }
}

// Server action to remove push subscription
export async function removePushSubscription(userId: string) {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing subscription:', error)
      return { success: false, error: error.message }
    }

    return { success: true, message: 'Subscription removed successfully' }
  } catch (error) {
    console.error('Error in removePushSubscription:', error)
    return { success: false, error: 'Failed to remove subscription' }
  }
}

// Legacy functions for backward compatibility
export async function subscribeUser(subscription: SerializedPushSubscription, userId: string) {
  return await storePushSubscription(subscription, userId)
}

export async function unsubscribeUser(userId: string) {
  return await removePushSubscription(userId)
}

export async function sendNotificationToUser(userId: string, title: string, message: string, data?: Record<string, unknown>) {
  try {
    const { data: subscription, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return { success: false, error: 'No push subscription found for user' }
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/logo-asset-white.svg',
      badge: '/logo-asset-white.svg',
      tag: 'notification',
      requireInteraction: false,
      data: data || {}
    })

    await webpush.sendNotification(pushSubscription, payload)
    
    return { success: true, message: 'Notification sent successfully' }
  } catch (error) {
    console.error('Error sending notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}

export async function sendNotificationBasedOnData(notificationData: {
  subscriber: string
  content_type: string
  content_uri: string  
  author_name: string
}) {
  const title = notificationData.content_type === 'discussions' ? 
    'New Reply to Your Post' : 'New Reply to Your Comment'
  
  const message = `${notificationData.author_name} replied to your ${notificationData.content_type === 'discussions' ? 'post' : 'comment'}`
  
  return await sendNotificationToUser(
    notificationData.subscriber,
    title,
    message,
    { 
      url: notificationData.content_uri,
      content_type: notificationData.content_type
    }
  )
}
