import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToUser } from '@/app/actions/push-notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, userId, url } = body

    if (!title || !message || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, message, userId' },
        { status: 400 }
      )
    }

    // Send push notification
    const result = await sendNotificationToUser(
      userId,
      title,
      message,
      { url: url || '/' }
    )

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Push notification sent successfully' 
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in test push notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
