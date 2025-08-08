'use server'

import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

// Create a service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure VAPID
webpush.setVapidDetails(
  'mailto:salamp.arta@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(subscriptionData: {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}, userId: string) {
  try {
    // Store subscription in Supabase using service role client
    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription_data: subscriptionData,
        endpoint: subscriptionData.endpoint,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error storing subscription:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in subscribeUser:', error)
    return { success: false, error: 'Failed to subscribe user' }
  }
}

export async function unsubscribeUser(userId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing subscription:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in unsubscribeUser:', error)
    return { success: false, error: 'Failed to unsubscribe user' }
  }
}

export async function sendNotificationToUser(userId: string, title: string, message: string, data?: Record<string, unknown>) {
  try {
    // Get user's subscription using service role client
    const { data: subscriptionData, error: fetchError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('subscription_data')
      .eq('user_id', userId)
      .single()

    if (fetchError || !subscriptionData) {
      return { success: false, error: 'No subscription found for user' }
    }

    // Send push notification
    await webpush.sendNotification(
      subscriptionData.subscription_data,
      JSON.stringify({
        title,
        body: message,
        icon: '/logo-asset-white.svg',
        badge: '/logo-asset-white.svg',
        data: {
          url: data?.url || '/',
          ...data
        }
      })
    )

    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification', details: error }
  }
}

// Send notification to multiple users based on notification data
export async function sendNotificationBasedOnData(notificationData: {
  subscriber: string
  content_type: string
  content_uri: string
  author_name?: string
}) {
  try {
    let title = 'Notifikasi Baru'
    let body = ''

    // Customize notification based on content type
    if (notificationData.content_type === 'discussions') {
      title = '💬 Balasan Baru'
      body = `${notificationData.author_name} membalas postingan Anda`
    } else if (notificationData.content_type === 'comments') {
      title = '💬 Komentar Baru'
      body = `${notificationData.author_name} membalas komentar Anda`
    }

    const result = await sendNotificationToUser(
      notificationData.subscriber,
      title,
      body,
      {
        url: notificationData.content_uri,
        type: notificationData.content_type
      }
    )

    return result
  } catch (error) {
    console.error('Error sending notification based on data:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}
