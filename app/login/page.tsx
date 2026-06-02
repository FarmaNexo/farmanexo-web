"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLogin, useIsAuthenticated } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const { isAuthenticated } = useIsAuthenticated()
    const loginMutation = useLogin()
    const isLoading = loginMutation.isPending
    const error = loginMutation.error?.message ?? null

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [emailError, setEmailError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    // Redirigir si ya está autenticado — honra ?redirect= si viene
    useEffect(() => {
        if (isAuthenticated) {
            const param = new URLSearchParams(window.location.search).get("redirect")
            const dest = param && param.startsWith("/") && !param.startsWith("//") ? param : "/"
            router.push(dest)
        }
    }, [isAuthenticated, router])

    // Limpiar el error de la mutación al cambiar inputs
    useEffect(() => {
        if (loginMutation.error) loginMutation.reset()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password])

    const validateEmail = (value: string) => {
        if (!value) {
            setEmailError("El email es requerido")
            return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailError("Ingresa un email válido")
            return false
        }
        setEmailError("")
        return true
    }

    const validatePassword = (value: string) => {
        if (!value) {
            setPasswordError("La contraseña es requerida")
            return false
        }
        if (value.length < 6) {
            setPasswordError("Mínimo 6 caracteres")
            return false
        }
        setPasswordError("")
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const isEmailValid = validateEmail(email)
        const isPasswordValid = validatePassword(password)

        if (!isEmailValid || !isPasswordValid) return

        // onSuccess en el hook redirige a "/"
        loginMutation.mutate({ email, password })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F5F3FF] via-background to-[#F5F3FF]/50">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#db1a85] text-white">
                        <span className="text-xl font-bold">F</span>
                    </div>
                    <span className="text-2xl font-bold text-[#db1a85]">
                        FarmaNexo
                    </span>
                </Link>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold">Iniciar sesión</CardTitle>
                        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error global */}
                            {error && (
                                <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => validateEmail(email)}
                                        className={`pl-10 ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoFocus
                                        autoComplete="email"
                                    />
                                </div>
                                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Contraseña
                                    </label>
                                    <Link href="/recuperar-contrasena" className="text-xs text-[#db1a85] hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => validatePassword(password)}
                                        className={`pl-10 pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-[#db1a85] hover:bg-[#b8146f] text-white transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Iniciando sesión...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </Button>
                        </form>

                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">¿No tienes cuenta?</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full bg-transparent" asChild>
                            <Link href="/registro">Crear una cuenta</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Volver al inicio */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    <Link href="/" className="hover:text-foreground transition-colors">
                        ← Volver al inicio
                    </Link>
                </p>
            </div>
        </div>
    )
}

