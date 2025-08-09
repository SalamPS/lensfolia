/* eslint-disable @next/next/no-img-element */
'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function SignupModal() {
  const { signInWithProvider, user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true)
      await signInWithProvider(provider)
    } catch (error) {
      console.error('Login error:', error)
      // You can add toast notification here
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // If user is logged in, show logout button instead
  if (user) {
    return (
      <Button 
        variant="outline" 
        onClick={handleSignOut}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Logout'}
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Daftar</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="bg-primary flex size-11 shrink-0 items-center justify-center rounded-full shadow-[0px_0px_24px_rgba(20,184,166,0.7)]"
            aria-hidden="true"
          >
            <img
              src="/logo-asset-white.svg"
              width={24}
              height={24}
              alt="logo"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="py-2 sm:text-center">
              Daftar untuk bergabung dengan LensFolia
            </DialogTitle>
            <DialogDescription className="text-pretty sm:text-center">
              Bergabunglah dengan layanan kami agar bisa menyimpan riwayat
              deteksi
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleSignIn('google')}
            disabled={isLoading}
          >
            <img src="/google.png" width={16} height={16} alt="Google" />
            {isLoading ? 'Loading...' : 'Lanjutkan dengan Google'}
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => handleSignIn('github')}
            disabled={isLoading}
          >
            <img
              src="/github-icon-2.svg"
              width={18}
              height={18}
              alt="GitHub"
            />
            {isLoading ? 'Loading...' : 'Lanjutkan dengan GitHub'}
          </Button>
        </div>

        <p className="text-muted-foreground text-center text-xs">
          Dengan mendaftar, Anda menyetujui{" "}
          <a className="underline hover:no-underline" href="#">
            Persyaratan kami
          </a>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
