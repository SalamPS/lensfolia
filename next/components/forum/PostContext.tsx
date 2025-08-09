"use client"

import { anonUser_, useAuth } from '@/hooks/useAuth';
import { User } from '@supabase/supabase-js';
import React, { useState } from 'react';

export const PostContext = React.createContext<{
  refresh: number;
  user: User | null;
  anonUser: anonUser_ | null;
  authLoading: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<number>>;
}>({
  refresh: 0,
  user: null,
  anonUser: null,
  authLoading: false,
  setRefresh: () => {},
});

export const PostContextProvider = ({children}: {children: React.ReactNode}) => {
  const { user, loading: authLoading, anonUser } = useAuth();
  const [refresh, setRefresh] = useState<number>(0);

  return (
    <PostContext.Provider value={{ refresh, setRefresh, user, authLoading, anonUser }}>
      {children}
    </PostContext.Provider>
  );
};