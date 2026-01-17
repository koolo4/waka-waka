"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Валидация на клиенте
    if (password !== confirmPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Произошла ошибка при регистрации')
        return
      }

      setSuccess(data.message || "Регистрация успешна! Теперь вы можете войти в систему.")

      // Через 2 секунды перенаправляем на страницу входа
      setTimeout(() => {
        router.push("/auth/signin")
      }, 2000)

    } catch (error) {
      console.error('Ошибка регистрации:', error)
      setError("Произошла ошибка при регистрации")
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
            Зарегистрируйтесь в киберпространстве
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
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
                minLength={3}
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Пароль должен быть не короче 6 символов</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full cyber-button bg-gradient-to-r from-cyan-500/50 to-magenta-500/50 border-cyan-500/50 text-white hover:border-cyan-400 hover:text-cyan-100 font-bold"
              disabled={isLoading || success !== ""}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Регистрация...
                </>
              ) : (
                "Зарегистрироваться"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-cyan-400">Уже есть аккаунт? </span>
            <Link href="/auth/signin" className="text-magenta-400 hover:text-magenta-300 underline">
              Войти
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-cyan-500 hover:text-cyan-400 underline">
              ← Вернуться на главную
            </Link>
          </div>


        </CardContent>
      </Card>
    </div>
  )
}
