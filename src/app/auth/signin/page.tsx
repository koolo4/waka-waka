"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignInPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверное имя пользователя или пароль")
      } else {
        // Успешный вход - перенаправляем на главную
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Произошла ошибка при входе в систему")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 relative overflow-hidden">
      {/* Matrix rain background effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,rgba(0,255,65,0.03)_1px)] bg-[length:50px_50px]"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-cyan-500/30 bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl neon-text-magenta font-mono font-black tracking-wider">
            WAKA-WAKA
          </CardTitle>
          <CardDescription className="text-cyan-400">
            Войдите в киберпространство
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full cyber-button bg-gradient-to-r from-cyan-500/50 to-magenta-500/50 border-cyan-500/50 text-white hover:border-cyan-400 hover:text-cyan-100 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Вход...
                </>
              ) : (
                "Войти"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-cyan-400">Нет аккаунта? </span>
            <Link href="/auth/signup" className="text-magenta-400 hover:text-magenta-300 underline">
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-cyan-500 hover:text-cyan-400 underline">
              ← Вернуться на главную
            </Link>
          </div>

          {/* Подсказка для тестирования */}
          <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-xs text-green-400 font-mono">
            <strong>NEURAL RECOMMENDATION ENGINE</strong><br />
            Админ: admin@waka.com / admin123<br />
            Пользователь: user1@example.com / user123
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
