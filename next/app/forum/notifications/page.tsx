import NotificationPage from '@/components/forum/NotificationPage'
import { PostContextProvider } from '@/components/forum/PostContext'
import Navbar from '@/components/home/Navbar'
import React from 'react'

const page = () => {
  return (
    <PostContextProvider>
      <Navbar />
      <NotificationPage />
    </PostContextProvider>
  )
}

export default page