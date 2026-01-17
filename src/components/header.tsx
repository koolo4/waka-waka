"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, User, LogOut, UserCog, Zap, Terminal, Shield, Sparkles, Users, Trophy, Filter, MessageSquare, Menu, X } from "lucide-react"
import { SearchBar } from "./search-bar"
import { NotificationCenter } from "./notification-center-new"
import { AdvancedSearchFilters } from "./advanced-search-filters"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = (session?.user?.role || '').toString().toUpperCase() === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="w-full px-2 lg:px-4 flex h-16 items-center justify-between relative">
        {/* Scan line effect */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
          <Link
            href="/"
            className="text-lg lg:text-2xl font-black neon-text-magenta hover:neon-text transition-all duration-300 relative group whitespace-nowrap"
          >
            <span className="font-mono tracking-tight">WAKA_WAKA</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-magenta-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
        </div>

        {/* SearchBar - center (desktop only) */}
        {session && (
          <div className="hidden lg:flex flex-1 mx-4">
            <SearchBar />
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {session ? (
            <>
              <Button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                size="sm"
                className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 px-2"
              >
                <Filter className="h-4 w-4" />
              </Button>

              <Button size="sm" className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 px-2" asChild>
                <Link href="/recommendations" title="Рекомендации">
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="sm" className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300 px-2" asChild>
                <Link href="/users" title="Пользователи">
                  <Users className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="sm" className="cyber-button border-yellow-500/50 text-yellow-400 hover:border-yellow-400 hover:text-yellow-300 px-2" asChild>
                <Link href="/rankings" title="Рейтинг">
                  <Trophy className="h-4 w-4" />
                </Link>
              </Button>

              <Button size="sm" className="cyber-button border-cyan-500/50 text-cyan-300 hover:border-cyan-400 hover:text-cyan-200 font-bold px-2" asChild>
                <Link href="/messages" title="Сообщения">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              <div className="w-px h-6 bg-cyan-500/20 mx-1"></div>

              <NotificationCenter />

              {isAdmin && (
                <Button size="sm" className="cyber-button border-green-500/50 text-green-400 hover:border-green-400 hover:text-green-300 px-2" asChild>
                  <Link href="/admin" title="Admin">
                    <Zap className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                    <Avatar className="h-9 w-9 border-2 border-cyan-500/50">
                      <AvatarImage src={session.user.avatar || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-magenta-900 text-cyan-300 font-mono font-bold text-xs">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 cyber-card border-cyan-500/30" align="end">
                  <div className="flex items-center justify-start gap-2 p-3 border-b border-cyan-500/20">
                    <Avatar className="h-8 w-8 border-2 border-cyan-500/50">
                      <AvatarImage src={session.user.avatar || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-magenta-900 text-cyan-300 font-mono text-xs">{session.user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-mono font-bold text-cyan-300 text-sm">{session.user.name}</p>
                      <p className="w-[160px] truncate text-xs text-muted-foreground font-mono">{session.user.email}</p>
                    </div>
                  </div>

                  <DropdownMenuItem asChild className="hover:bg-cyan-500/10 focus:bg-cyan-500/10">
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-cyan-400" />
                      <span className="font-mono text-sm">Профиль</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="hover:bg-green-500/10 focus:bg-green-500/10">
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-green-400" />
                        <span className="font-mono text-sm">Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-cyan-500/20" />

                  <DropdownMenuItem
                    className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-mono text-sm">Выход</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300" asChild>
                <Link href="/auth/signin" className="font-mono text-xs">Вход</Link>
              </Button>
              <Button size="sm" className="cyber-button bg-gradient-to-r from-magenta-500/20 to-cyan-500/20 border-magenta-500/50 text-magenta-400 hover:border-magenta-400" asChild>
                <Link href="/auth/signup" className="font-mono text-xs">Регистрация</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-cyan-400" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-cyan-400" />
          ) : (
            <Menu className="h-5 w-5 text-cyan-400" />
          )}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-cyan-500/20 bg-card/95 backdrop-blur-md">
          <nav className="flex flex-col gap-2 p-4">
            {session ? (
              <>
                <Button onClick={() => setShowAdvancedSearch(!showAdvancedSearch)} className="cyber-button w-full justify-start">
                  <Filter className="h-4 w-4 mr-2" />
                  Фильтры
                </Button>
                <Button className="cyber-button w-full justify-start" asChild>
                  <Link href="/recommendations">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Рекомендации
                  </Link>
                </Button>
                <Button className="cyber-button w-full justify-start" asChild>
                  <Link href="/users">
                    <Users className="h-4 w-4 mr-2" />
                    Пользователи
                  </Link>
                </Button>
                <Button className="cyber-button w-full justify-start" asChild>
                  <Link href="/rankings">
                    <Trophy className="h-4 w-4 mr-2" />
                    Рейтинг
                  </Link>
                </Button>
                <Button className="cyber-button bg-gradient-to-r from-magenta-500/30 to-magenta-500/20 w-full justify-start" asChild>
                  <Link href="/messages">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Сообщения
                  </Link>
                </Button>
                <Button className="cyber-button w-full justify-start" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Профиль
                  </Link>
                </Button>
                {isAdmin && (
                  <Button className="cyber-button border-green-500/50 text-green-400 w-full justify-start" asChild>
                    <Link href="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button className="cyber-button w-full" asChild>
                  <Link href="/auth/signin">Вход</Link>
                </Button>
                <Button className="cyber-button bg-gradient-to-r from-magenta-500/20 w-full" asChild>
                  <Link href="/auth/signup">Регистрация</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
      </div>

      {/* Advanced Search Modal */}
      {showAdvancedSearch && (
        <div className="absolute top-full left-0 right-0 z-50 bg-card/95 border-t border-cyan-500/20">
          <div className="container p-4">
            <AdvancedSearchFilters />
          </div>
        </div>
      )}
    </header>
  )

}
