"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Zap } from "lucide-react";

export function NewHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { label: "Аниме", href: "/anime" },
    { label: "Тренды", href: "/trending" },
    { label: "Рекомендации", href: "/recommendations" },
    { label: "Сообщество", href: "/users" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-slate-950/30 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with effect */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-cosmic rounded-lg opacity-75 blur group-hover:blur-md transition-all" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg bg-gradient-cosmic bg-clip-text text-transparent hidden sm:block group-hover:opacity-80 transition-opacity">
              Aniverse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-slate-300 hover:text-white transition-colors group"
              >
                {item.label}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-cosmic group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <>
                <Link
                  href="/profile"
                  className="hidden sm:block px-4 py-2 rounded-lg bg-primary-600/20 text-primary-300 border border-primary-500/30 hover:bg-primary-600/40 transition-all"
                >
                  {session.user.name || "Profile"}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                >
                  Выход
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 rounded-lg bg-gradient-cosmic text-white font-medium hover:shadow-lg hover:shadow-primary-500/50 transition-all"
              >
                Вход
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden py-4 border-t border-slate-700/30 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
