'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export default function UserProfile() {
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg">
      {user.user_metadata?.avatar_url && (
        <Image
          src={user.user_metadata.avatar_url}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div className="flex-1">
        <p className="font-medium">{user.user_metadata?.full_name || user.email}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <Button variant="outline" size="sm" onClick={signOut}>
        Logout
      </Button>
    </div>
  )
}
