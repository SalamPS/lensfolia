"use client"

import React, { useState } from 'react';

export const PostContext = React.createContext<{
  refresh: number;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}>({
  refresh: 0,
  setRefresh: () => {},
});

export const PostContextProvider = ({children}: {children: React.ReactNode}) => {
  const [refresh, setRefresh] = useState<number>(0);

  return (
    <PostContext.Provider value={{ refresh, setRefresh }}>
      {children}
    </PostContext.Provider>
  );
};