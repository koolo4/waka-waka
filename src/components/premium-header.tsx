"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";

export function PremiumHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Каталог", href: "/anime", icon: "📚" },
    { label: "Тренды", href: "/trending", icon: "🔥" },
    { label: "Сообщество", href: "/users", icon: "👥" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50"
          : "bg-slate-950/20 backdrop-blur-sm border-b border-slate-700/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 bg-gradient-cosmic rounded-xl opacity-75 group-hover:opacity-100 blur-sm transition-all duration-300" />
              <div className="absolute inset-0 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                ANIVERSE
              </div>
              <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                Studio
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative px-4 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </span>
                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-cosmic scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/50 text-slate-100 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-cosmic flex items-center justify-center text-xs font-bold">
                    {(session.user.name || "U")[0]}
                  </div>
                  <span className="text-sm">{session.user.name || "Profile"}</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all text-sm"
                >
                  Выход
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-cosmic text-white font-semibold hover:shadow-lg hover:shadow-primary-500/50 transition-all transform hover:scale-105 group"
              >
                Вход
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-slate-700/30 space-y-2 animate-slide-in">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
