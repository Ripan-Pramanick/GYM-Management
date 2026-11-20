"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Classes", href: "/classes" },
  { name: "Trainers", href: "/trainers" },
  { name: "Membership", href: "/membership" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const checkIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <motion.nav
        aria-label="Main Navigation"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled || isMobileMenuOpen
            ? "bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 15 }} transition={{ type: "spring", stiffness: 300 }}>
                <Dumbbell className="text-brand-red h-8 w-8" />
              </motion.div>
              <span className="text-2xl font-extrabold tracking-widest text-white">
                FIT<span className="text-brand-red">CORE</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = checkIsActive(link.href);
                return (
                  <Link key={link.name} href={link.href} className="relative group py-2">
                    <span
                      className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-white" : "text-brand-gray group-hover:text-white"
                      }`}
                    >
                      {link.name}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-red"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="hidden lg:block">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/join">
                  <Button className="bg-brand-red hover:bg-red-700 text-white rounded-full px-6 py-5 font-bold shadow-[0_0_15px_rgba(220,38,38,0.3)]">
                    Join Now
                  </Button>
                </Link>
              </motion.div>
            </div>

            <button
              type="button"
              aria-label="Toggle Menu"
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden text-white p-2"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#09090b] pt-28 px-6 lg:hidden overflow-y-auto pb-12"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link, i) => {
                const isActive = checkIsActive(link.href);
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-xl font-bold block py-2 border-b border-white/10 transition-colors ${
                        isActive ? "text-brand-red" : "text-white"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-6"
              >
                <Link href="/join" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-brand-red hover:bg-red-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg shadow-brand-red/20">
                    Join FITCORE
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}