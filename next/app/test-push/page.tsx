'use client'

import { PushNotificationManager } from '@/components/pwa/PushNotificationManager'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { IconBell, IconSend } from '@tabler/icons-react'

export default function PushNotificationTest() {
  const { userId } = usePushNotifications()
  const [testData, setTestData] = useState({
    title: 'Test Notification',
    message: 'This is a test push notification from LensFolia!',
    url: '/'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const sendTestNotification = async () => {
    if (!userId) {
      setResult({ success: false, message: 'User not authenticated' })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/v1/notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testData,
          userId
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: 'Test notification sent successfully!' })
      } else {
        setResult({ success: false, message: data.error || 'Failed to send notification' })
      }
    } catch (err) {
      console.error('Network error:', err)
      setResult({ success: false, message: 'Network error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl mt-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <IconBell className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Push Notifications</h1>
              <p className="text-muted-foreground">
                Kelola pengaturan notifikasi push untuk mendapatkan update terbaru
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
              <CardDescription>
                Aktifkan atau matikan notifikasi push untuk akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationManager />
            </CardContent>
          </Card>

          {/* Test Notification */}
          <Card>
            <CardHeader>
              <CardTitle>Test Notifikasi Push</CardTitle>
              <CardDescription>
                Kirim notifikasi test untuk memastikan push notifications berfungsi dengan baik
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Judul</label>
                <Input
                  id="title"
                  value={testData.title}
                  onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul notifikasi"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Pesan</label>
                <Input
                  id="message"
                  value={testData.message}
                  onChange={(e) => setTestData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Masukkan pesan notifikasi"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium">URL (opsional)</label>
                <Input
                  id="url"
                  value={testData.url}
                  onChange={(e) => setTestData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="URL yang akan dibuka ketika notifikasi diklik"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={sendTestNotification}
                  disabled={isLoading || !testData.title.trim() || !testData.message.trim() || !userId}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Mengirim...</span>
                    </div>
                  ) : (
                    <>
                      <IconSend className="h-4 w-4 mr-2" />
                      Kirim Test Notifikasi
                    </>
                  )}
                </Button>
              </div>

              {result && (
                <div className={`p-3 rounded-lg ${
                  result.success 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {result.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Kapan notifikasi dikirim?</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Ketika ada balasan baru di postingan Anda</li>
                  <li>Ketika ada balasan baru di komentar Anda</li>
                  <li>Update penting dari sistem</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Browser harus mendukung Push API</li>
                  <li>Website harus diakses melalui HTTPS</li>
                  <li>Anda harus memberikan izin notifikasi</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Browser Support:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Chrome 42+</li>
                  <li>Firefox 44+</li>
                  <li>Safari 16+ (macOS 13+ dan iOS 16.4+ untuk PWA installed)</li>
                  <li>Edge 79+</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
