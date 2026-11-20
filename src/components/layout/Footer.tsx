"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Dumbbell, ArrowUp, CheckCircle2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    name: "Youtube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
      </svg>
    ),
  },
];

const quickLinks = [
  { name: "About", href: "/about" },
  { name: "Classes", href: "/classes" },
  { name: "Trainers", href: "/trainers" },
  { name: "Membership", href: "/membership" },
  { name: "Gallery", href: "/gallery" },
  { name: "Contact", href: "/contact" },
  { name: "Login", href: "/login" },
];

export default function Footer() {
  const [currentYear, setCurrentYear] = useState(2026);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = newsletterEmail.trim();
    if (!trimmedEmail || isSubscribing) return;

    try {
      setIsSubscribing(true);
      await supabase.from("contact_messages").insert([
        {
          name: "Newsletter Subscriber",
          email: trimmedEmail,
          message: "Newsletter subscription request from website footer.",
        },
      ]);
      setIsSubscribed(true);
      setNewsletterEmail("");
    } catch {
      setIsSubscribed(true);
      setNewsletterEmail("");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#050505] pt-20 pb-10 border-t border-white/5 relative z-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <Dumbbell className="text-brand-red h-8 w-8" />
              <span className="text-2xl font-extrabold tracking-widest text-white">
                FIT<span className="text-brand-red">CORE</span>
              </span>
            </Link>
            <p className="text-brand-gray text-sm leading-relaxed">
              Premium training, world-class equipment, and a supportive community. Built for those who demand excellence.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-gray hover:bg-brand-red hover:text-white transition-all transform hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-gray hover:text-brand-red text-sm font-medium transition-colors relative group inline-block"
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand-red transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm text-brand-gray">
              <li>
                123 Fitness Street,
                <br />
                Santipur, Nadia, West Bengal
              </li>
              <li>
                <a href="tel:+919876543210" className="hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:hello@fitcore.demo" className="hover:text-white transition-colors">
                  hello@fitcore.demo
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-brand-gray text-sm mb-4">Subscribe for fitness tips and special offers.</p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Subscribed! Thank you for joining.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Email Address"
                  aria-label="Email Address"
                  className="bg-[#09090b] border border-white/10 rounded-lg px-4 py-2 text-white text-sm w-full focus:outline-none focus:border-brand-red transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-brand-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors shrink-0 disabled:opacity-70"
                >
                  {isSubscribing ? "..." : "Join"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <p className="text-brand-gray text-xs">© {currentYear} FITCORE. All rights reserved.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 text-brand-gray hover:text-white text-xs font-bold uppercase tracking-widest transition-colors group"
          >
            Back To Top
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-red transition-colors group-hover:-translate-y-1 transform">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}