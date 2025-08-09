import MyPostPage from '@/components/forum/MyPostPage'
import { PostContextProvider } from '@/components/forum/PostContext'
import Navbar from '@/components/home/Navbar'
import React from 'react'

const page = () => {
  return (
    <PostContextProvider>
      <Navbar />
      <MyPostPage />
    </PostContextProvider>
  )
}

export default page