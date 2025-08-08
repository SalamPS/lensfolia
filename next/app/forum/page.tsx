import ForumPage from "@/components/forum/ForumPage";
import { PostContextProvider } from "@/components/forum/PostContext";
import Navbar from "@/components/home/Navbar";
import React from "react";

const Page = () => {
  return (
    <PostContextProvider>
      <Navbar />
      <ForumPage />
    </PostContextProvider>
  );
};

export default Page;
