'use server'

import { createClient } from '@supabase/supabase-js'
import { sendNotificationBasedOnData } from './push-notifications'

// Create a service role client for admin operations (server-side only)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface NotificationData {
  subscriber: string
  created_by: string
  content_type: 'discussions' | 'comments'
  content_uri: string
  ref_forums?: string
  ref_discussions?: string
  ref_comments?: string
  ori_discussion?: string
  ori_comments?: string
}

export async function createNotificationWithPush(notificationData: NotificationData) {
  try {
    // Insert notification into database
    const { data: notification, error: insertError } = await supabaseAdmin
      .from('notifications')
      .insert({
        subscriber: notificationData.subscriber,
        created_by: notificationData.created_by,
        content_type: notificationData.content_type,
        content_uri: notificationData.content_uri,
        ref_forums: notificationData.ref_forums || null,
        ref_discussions: notificationData.ref_discussions || null,
        ref_comments: notificationData.ref_comments || null,
        ori_discussion: notificationData.ori_discussion || null,
        ori_comments: notificationData.ori_comments || null,
      })
      .select(`
        *,
        author:user_profiles!created_by (
          id,
          name,
          profile_picture
        )
      `)
      .single()

    if (insertError) {
      console.error('Error creating notification:', insertError)
      return { success: false, error: insertError.message }
    }

    // Send push notification
    if (notification) {
      const pushResult = await sendNotificationBasedOnData({
        subscriber: notification.subscriber,
        content_type: notification.content_type,
        content_uri: notification.content_uri,
        author_name: notification.author?.name || 'Someone'
      })

      if (!pushResult.success) {
        console.warn('Failed to send push notification:', pushResult.error)
        // Don't fail the entire operation if push notification fails
      }
    }

    return { success: true, data: notification }
  } catch (error) {
    console.error('Error in createNotificationWithPush:', error)
    return { success: false, error: 'Failed to create notification' }
  }
}

// Helper function to create notification when replying to a post
export async function createReplyNotification(
  postAuthorId: string,
  replyAuthorId: string,
  postId: string,
  discussionId?: string
) {
  // Don't notify if user is replying to their own post
  if (postAuthorId === replyAuthorId) {
    return { success: true, data: null }
  }

  return await createNotificationWithPush({
    subscriber: postAuthorId,
    created_by: replyAuthorId,
    content_type: 'discussions',
    content_uri: `/forum/post/${postId}${discussionId ? `#d-${discussionId}` : ''}`,
    ref_forums: postId,
    ref_discussions: discussionId,
  })
}

// Helper function to create notification when replying to a comment
export async function createCommentReplyNotification(
  postId: string,
  commentId: string,
  replyAuthorId: string,
  commentAuthorId: string,
  discussionId?: string
) {
  // Don't notify if user is replying to their own comment
  if (commentAuthorId === replyAuthorId) {
    return { success: true, data: null }
  }

  return await createNotificationWithPush({
    subscriber: commentAuthorId,
    created_by: replyAuthorId,
    content_type: 'comments',
    content_uri: `/forum/post/${postId}${discussionId ? `#d-${discussionId}` : ''}#c-${commentId}`,
    ref_comments: commentId,
    ori_discussion: discussionId,
    ori_comments: commentId,
  })
}
