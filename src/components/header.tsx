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
import { Sun, Moon, User, LogOut, UserCog, Zap, Terminal, Shield, Sparkles, Users } from "lucide-react"

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const isAdmin = (session?.user?.role || '').toString().toUpperCase() === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between relative">
        {/* Scan line effect */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-2xl font-black neon-text-magenta hover:neon-text transition-all duration-300 relative group"
          >
            <span className="font-mono tracking-tight">WAKA_WAKA</span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-magenta-500 group-hover:w-full transition-all duration-300"></div>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              <Button className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300" asChild>
                <Link href="/recommendations" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Рекомендации
                </Link>
              </Button>

              <Button className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300" asChild>
                <Link href="/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Пользователи
                </Link>
              </Button>

              {isAdmin && (
                <Button className="cyber-button border-green-500/50 text-green-400 hover:border-green-400 hover:text-green-300" asChild>
                  <Link href="/admin/add-anime" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Загрузить аниме
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300">
                    <Avatar className="h-10 w-10 border-2 border-cyan-500/50">
                      <AvatarImage src={session.user.avatar || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-900 to-magenta-900 text-cyan-300 font-mono font-bold">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {/* Status indicator */}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-card"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 cyber-card border-cyan-500/30" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-4 border-b border-cyan-500/20">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-mono font-bold text-cyan-300">{session.user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground font-mono">
                        {session.user.email}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-mono">ONLINE</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem asChild className="hover:bg-cyan-500/10 focus:bg-cyan-500/10 my-1">
                    <Link href="/profile" className="flex items-center py-3 px-4">
                      <User className="mr-3 h-4 w-4 text-cyan-400" />
                      <span className="font-mono">Профиль пользователя</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="hover:bg-cyan-500/10 focus:bg-cyan-500/10 my-1">
                    <Link href="/profile" className="flex items-center py-3 px-4">
                      <Users className="mr-3 h-4 w-4 text-cyan-400" />
                      <span className="font-mono">Друзья и запросы</span>
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild className="hover:bg-green-500/10 focus:bg-green-500/10 my-1">
                      <Link href="/admin" className="flex items-center py-3 px-4">
                        <Shield className="mr-3 h-4 w-4 text-green-400" />
                        <span className="font-mono">Админ-терминал</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-cyan-500/20" />

                  <DropdownMenuItem
                    className="flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 py-3 px-4 my-1"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-mono">Disconnect</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                className="cyber-button border-cyan-500/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300"
                asChild
              >
                <Link href="/auth/signin" className="font-mono">
                  Подключиться
                </Link>
              </Button>
              <Button
                className="cyber-button bg-gradient-to-r from-magenta-500/20 to-cyan-500/20 border-magenta-500/50 text-magenta-400 hover:border-magenta-400 hover:text-magenta-300"
                asChild
              >
                <Link href="/auth/signup" className="font-mono">
                  Регистрация
                </Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-cyan-400" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
            <span className="sr-only">Переключить тему</span>
          </Button>
        </nav>
      </div>

      {/* Animated grid overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"></div>
      </div>
    </header>
  )
}
