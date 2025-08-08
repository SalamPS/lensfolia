/* eslint-disable @next/next/no-img-element */
"use client";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { IconArrowUpRight, IconMenu2, IconX, IconBookmark, IconLogout, IconUser, IconMail } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import SignupModal from "../auth/signup-modal";
import { userNavbar_ } from "../types/user";
import { useAuth } from "@/hooks/useAuth";
import { PushNotificationToggle } from "../pwa/PushNotificationToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const navItems = [
  { label: "Intro", href: "#intro" },
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

export const navItemsFeatures = [
  { label: "Deteksi", href: "/detect" },
  { label: "Lensiklopedia", href: "/encyclopedia" },
  { label: "Forum", href: "/forum" },
];

const Navbar = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const userForNavbar: userNavbar_ = {
    id: user?.id || "",
    name: user?.user_metadata?.full_name || user?.email || 'User',
    email: user?.email || '',
    profilePicture: user?.user_metadata?.avatar_url || '/profile.jpg',
    createdAt: user?.created_at || "",
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  };

  return (
    <>
      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b px-3 py-3 backdrop-blur-lg md:px-4">
        <div className={`mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-3`}>
          {/* Logo dan Nama Aplikasi */}
          <div className="flex items-center">
            <Link
              href="/"
              className="relative flex h-[28px] w-[28px] shrink-0 items-center gap-2"
              aria-label="Go to top"
            >
              <img
                src="/logo-asset-black.svg"
                alt="App Logo"
                className="dark:hidden w-full h-full"
              />
              <img
                src="/logo-asset-white.svg"
                alt="App Logo"
                className="hidden dark:block w-full h-full"
              />
              <p className="text-foreground hidden font-bold md:flex">
                Lensfolia
              </p>
            </Link>
          </div>
          {/* CTA */}

          {/* Desktop Navigation */}
          {pathname == "/" ? (
            <nav className="hidden items-center justify-center gap-6 md:flex">
              {navItems.map(({ label, href }) => (
                <Link
                  href={href}
                  key={label}
                  className="text-muted-foreground/80 group hover:text-card-foreground relative rounded-md px-3 py-1 text-sm font-semibold transition-all duration-300"
                  title={label}
                >
                  {label}
                </Link>
              ))}
            </nav>
          ) : (
            <nav className="hidden items-center justify-center gap-6 md:flex">
              {navItemsFeatures.map(({ label, href }) => (
                <Link
                  href={href}
                  key={label}
                  className={`relative rounded-md px-3 py-1 text-sm font-semibold transition-all duration-300 ${pathname === href ? "text-card-foreground" : "text-muted-foreground/80 group hover:text-card-foreground"}`}
                  title={label}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center justify-end gap-2">
            <ModeToggle />
            {userForNavbar && userForNavbar?.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:ring-primary flex items-center justify-center rounded-md px-3 py-2 transition-colors duration-200 hover:bg-card/50 focus:ring-1 focus:outline-none">
                  <div className="cursor-pointer bg-primary relative aspect-square h-6 shrink-0 overflow-hidden rounded-full">
                    <img
                      src={userForNavbar.profilePicture || "not-found.svg"}
                      alt={userForNavbar.name[0]}
                      className="aspect-square w-full rounded-full"
                    />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center gap-2">
                        <IconUser size={16} className="text-muted-foreground" />
                        <p className="text-sm font-medium leading-none">
                          {userForNavbar.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconMail size={16} className="text-muted-foreground" />
                        <p className="text-xs leading-none text-muted-foreground">
                          {userForNavbar.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookmarks" className="flex items-center gap-2 cursor-pointer">
                      <IconBookmark size={16} />
                      Bookmark
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-0">
                    <div className="p-1 w-full">
                      <PushNotificationToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <IconLogout size={16} />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : pathname == "/" ? (
              <Link
                className="bg-primary hover:shadow-primary/25 hover:from-primary hover:to-primary/80 group relative hidden items-center justify-center gap-2 overflow-hidden rounded-md px-3 py-2 transition-all duration-300 ease-out hover:scale-105 hover:bg-gradient-to-r hover:shadow-lg md:flex md:gap-2"
                href="/detect"
              >
                <p className="text-sm font-semibold text-white transition-transform duration-300 ease-out group-hover:translate-x-[-2px]">
                  Mulai
                </p>
                <IconArrowUpRight
                  className="text-white transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:translate-y-[-1px] group-hover:scale-110 group-hover:rotate-12"
                  size={20}
                />
                {/* Subtle shine effect */}
                <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[100%]" />
              </Link>
            ) : (
              <SignupModal />
            )}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="text-foreground hover:bg-card/50 focus:ring-primary flex items-center justify-center rounded-md p-2 transition-colors duration-200 focus:ring-1 focus:outline-none cursor-pointer"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <IconX size={20} />
                ) : (
                  <IconMenu2 size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Blurry Background */}
            <motion.div
              className="bg-background/70 absolute inset-0 backdrop-blur-md"
              onClick={closeMobileMenu}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Mobile Navigation Menu */}
            <motion.div
              className="bg-background/20 absolute inset-0 flex items-center justify-center backdrop-blur-lg"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {pathname == "/" ? (
                <nav className="w-full px-8 py-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {navItems.map(({ label, href }, index) => (
                      <motion.div
                        key={label}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="w-full"
                      >
                        <Link
                          href={href}
                          onClick={closeMobileMenu}
                          className="text-foreground hover:bg-card/50 flex w-full items-center justify-center rounded-lg px-4 py-3 text-xl font-semibold transition-all duration-200 hover:inset-shadow-sm hover:inset-shadow-white/5 dark:hover:shadow"
                          title={label}
                        >
                          {label}
                        </Link>
                      </motion.div>
                    ))}

                    {/* Mobile CTA Section */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: navItems.length * 0.1 + 0.1 }}
                      className="w-full"
                    >
                      <Link
                        href="/detect"
                        className="bg-primary flex items-center justify-center gap-2 rounded-lg p-3"
                      >
                        <IconArrowUpRight className="text-white" size={24} />
                        <p className="text-xl font-semibold text-white">
                          Mulai
                        </p>
                      </Link>
                    </motion.div>
                  </div>
                </nav>
              ) : (
                <nav className="w-full px-8 py-6">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {navItemsFeatures.map(({ label, href }, index) => (
                      <motion.div
                        key={label}
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        className="w-full"
                      >
                        <Link
                          href={href}
                          onClick={closeMobileMenu}
                          className={`text-foreground hover:bg-card/50 flex w-full items-center justify-center rounded-lg px-4 py-3 text-xl font-semibold transition-all duration-200 hover:inset-shadow-sm hover:inset-shadow-white/5 dark:hover:shadow ${pathname === href ? "text-card-foreground" : "text-muted-foreground/80 group hover:text-card-foreground"}`}
                          title={label}
                        >
                          {label}
                        </Link>
                      </motion.div>
                    ))}

                    
                  </div>
                </nav>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
