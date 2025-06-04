"use client";

import Image from "next/image";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "../ui/button";
import { IconArrowUpRight, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";

export const navItems = [
  { label: "Intro", href: "#intro" },
  { label: "Fitur", href: "#features" },
  { label: "Cara Kerja", href: "#how-to-works" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const { theme } = useTheme();

  return (
    <>
      <header className="bg-background/80 border-border fixed top-0 z-50 w-full border-b px-3 py-3 backdrop-blur-lg md:px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex w-full items-center justify-between">
            {/* Logo dan Nama Aplikasi */}
            <div className="flex shrink-0 items-center gap-2">
              <Image
                src={
                  theme === "dark"
                    ? "/logo-asset-white.svg"
                    : "/logo-asset-black.svg"
                }
                alt="App Logo"
                height={28}
                width={28}
              />
              <p className="text-foreground hidden font-bold md:flex">
                Lensfolia
              </p>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <nav className="flex items-center justify-center gap-6">
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
            </div>

            {/* CTA */}
            <div className="flex items-center justify-center gap-2">
              <Button variant="link" className="font-bold">
                ID
              </Button>
              <ModeToggle />
              <Link
                href="/DetectionPage"
                className="bg-primary hidden items-center justify-center gap-2 rounded-md px-3 py-2 md:flex md:gap-2"
              >
                <p className="text-sm font-semibold text-white">Mulai</p>
                <IconArrowUpRight className="text-white" size={20} />
              </Link>
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="text-foreground hover:bg-card/50 focus:ring-primary flex items-center justify-center rounded-md p-2 transition-colors duration-200 focus:ring-1 focus:outline-none"
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
                    transition={{ delay: navItems.length * 0.1 + 0.2 }}
                    className="w-full"
                  >
                    <Link
                      href="/DetectionPage"
                      className="bg-primary flex items-center justify-center gap-2 rounded-lg p-3"
                    >
                      <IconArrowUpRight className="text-white" size={24} />
                      <p className="text-xl font-semibold text-white">Mulai</p>
                    </Link>
                  </motion.div>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
