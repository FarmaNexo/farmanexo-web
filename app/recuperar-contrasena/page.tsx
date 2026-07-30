"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useIsAuthenticated } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"

export default function RecoverPasswordPage() {
    const router = useRouter()
    const { isAuthenticated } = useIsAuthenticated()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [email, setEmail] = useState("")
    const [emailError, setEmailError] = useState("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/")
        }
    }, [isAuthenticated, router])

    useEffect(() => {
        setError(null)
    }, [email])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateEmail(email)) return

        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "No se pudo procesar la solicitud")
            }
            // Respuesta genérica: no revelamos si el correo existe.
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo procesar la solicitud")
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
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
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h2 className="text-xl font-semibold">Revisa tu correo</h2>
                                <p className="text-muted-foreground">
                                    Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un enlace para restablecer tu
                                    contraseña.
                                </p>
                                <div className="pt-4 w-full space-y-3">
                                    <Button className="w-full" asChild>
                                        <Link href="/login">Volver al inicio de sesión</Link>
                                    </Button>
                                    <Button variant="ghost" className="w-full" onClick={() => setSuccess(false)}>
                                        Enviar a otro correo
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nota */}
                    <p className="mt-6 text-center text-xs text-muted-foreground">
                        Si no recibes el correo en unos minutos, revisa tu carpeta de spam.
                    </p>
                </div>
            </div>
        )
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
                        <CardTitle className="text-2xl font-bold">Recuperar contraseña</CardTitle>
                        <CardDescription>Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</CardDescription>
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

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full bg-[#db1a85] hover:bg-[#b8146f] text-white transition-colors"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar enlace de recuperación"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Volver */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                    <Link href="/login" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" />
                        Volver al inicio de sesión
                    </Link>
                </p>
            </div>
        </div>
    )
}

