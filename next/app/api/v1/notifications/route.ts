import { NextRequest, NextResponse } from 'next/server'
import { createNotificationWithPush } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      subscriber, 
      created_by, 
      content_type, 
      content_uri, 
      ref_forums, 
      ref_discussions, 
      ref_comments,
      ori_discussion,
      ori_comments 
    } = body

    // Validate required fields
    if (!subscriber || !created_by || !content_type || !content_uri) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriber, created_by, content_type, content_uri' },
        { status: 400 }
      )
    }

    // Validate content_type
    if (!['discussions', 'comments'].includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid content_type. Must be "discussions" or "comments"' },
        { status: 400 }
      )
    }

    // Don't notify if user is replying to their own content
    if (subscriber === created_by) {
      return NextResponse.json({ 
        success: true, 
        message: 'No notification needed for self-reply',
        skipped: true 
      })
    }

    // Create notification with push
    const result = await createNotificationWithPush({
      subscriber,
      created_by,
      content_type,
      content_uri,
      ref_forums,
      ref_discussions,
      ref_comments,
      ori_discussion,
      ori_comments
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification created and push sent successfully',
        data: result.data 
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
