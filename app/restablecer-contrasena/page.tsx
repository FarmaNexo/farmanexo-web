"use client"

import type React from "react"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token") ?? ""

    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [fieldError, setFieldError] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const validate = () => {
        if (password.length < 8) {
            setFieldError("La contraseña debe tener al menos 8 caracteres")
            return false
        }
        if (password !== confirm) {
            setFieldError("Las contraseñas no coinciden")
            return false
        }
        setFieldError("")
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: password }),
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.message || "No se pudo restablecer la contraseña")
            }
            setSuccess(true)
        } catch (err) {
            setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña")
        } finally {
            setIsLoading(false)
        }
    }

    // Sin token en la URL: el enlace es inválido.
    if (!token) {
        return (
            <Card className="border-border/50 shadow-xl">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h2 className="text-xl font-semibold">Enlace inválido</h2>
                        <p className="text-muted-foreground">
                            El enlace de restablecimiento no es válido. Solicita uno nuevo desde &quot;¿Olvidaste tu contraseña?&quot;.
                        </p>
                        <Button className="w-full" asChild>
                            <Link href="/recuperar-contrasena">Solicitar nuevo enlace</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (success) {
        return (
            <Card className="border-border/50 shadow-xl">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h2 className="text-xl font-semibold">Contraseña actualizada</h2>
                        <p className="text-muted-foreground">
                            Tu contraseña se restableció correctamente. Por seguridad, se cerraron las demás sesiones.
                        </p>
                        <Button className="w-full" onClick={() => router.push("/login")}>
                            Iniciar sesión
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold">Nueva contraseña</CardTitle>
                <CardDescription>Ingresa y confirma tu nueva contraseña</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Nueva contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                autoFocus
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirm" className="text-sm font-medium">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirm"
                                type="password"
                                placeholder="Repite la contraseña"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className={`pl-10 ${fieldError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                autoComplete="new-password"
                            />
                        </div>
                        {fieldError && <p className="text-xs text-destructive">{fieldError}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-[#db1a85] hover:bg-[#b8146f] text-white transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Restablecer contraseña"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F5F3FF] via-background to-[#F5F3FF]/50">
            <div className="w-full max-w-md">
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#db1a85] text-white">
                        <span className="text-xl font-bold">F</span>
                    </div>
                    <span className="text-2xl font-bold text-[#db1a85]">FarmaNexo</span>
                </Link>

                <Suspense fallback={<div className="text-center text-muted-foreground">Cargando...</div>}>
                    <ResetPasswordForm />
                </Suspense>

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
