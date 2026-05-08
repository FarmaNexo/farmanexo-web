"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useRegister, useIsAuthenticated } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

interface RegisterFormData {
    name: string
    email: string
    password: string
    phone?: string
}
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, Loader2, Check, X } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const { isAuthenticated } = useIsAuthenticated()
    const registerMutation = useRegister()
    const isLoading = registerMutation.isPending
    const error = registerMutation.error?.message ?? null

    const [formData, setFormData] = useState<RegisterFormData>({
        name: "",
        email: "",
        password: "",
        phone: "",
    })
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})
    const [acceptedTerms, setAcceptedTerms] = useState(false)
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
    const [marketingOptIn, setMarketingOptIn] = useState(false)

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/")
        }
    }, [isAuthenticated, router])

    // Limpiar error de la mutación al cambiar inputs
    useEffect(() => {
        if (registerMutation.error) registerMutation.reset()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, confirmPassword])

    // Validaciones de contraseña
    const passwordChecks = {
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    }

    const isPasswordStrong = Object.values(passwordChecks).filter(Boolean).length >= 4

    const validateField = (field: string, value: string) => {
        const newErrors = { ...errors }

        switch (field) {
            case "name":
                if (!value.trim()) {
                    newErrors.name = "El nombre es requerido"
                } else if (value.trim().length < 2) {
                    newErrors.name = "El nombre debe tener al menos 2 caracteres"
                } else {
                    delete newErrors.name
                }
                break

            case "email":
                if (!value) {
                    newErrors.email = "El email es requerido"
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = "Ingresa un email válido"
                } else {
                    delete newErrors.email
                }
                break

            case "password":
                if (!value) {
                    newErrors.password = "La contraseña es requerida"
                } else if (!isPasswordStrong) {
                    newErrors.password = "La contraseña no es lo suficientemente segura"
                } else {
                    delete newErrors.password
                }
                // También validar confirmación si ya fue tocada
                if (touched.confirmPassword && value !== confirmPassword) {
                    newErrors.confirmPassword = "Las contraseñas no coinciden"
                } else if (touched.confirmPassword) {
                    delete newErrors.confirmPassword
                }
                break

            case "confirmPassword":
                if (!value) {
                    newErrors.confirmPassword = "Confirma tu contraseña"
                } else if (value !== formData.password) {
                    newErrors.confirmPassword = "Las contraseñas no coinciden"
                } else {
                    delete newErrors.confirmPassword
                }
                break

            case "phone":
                if (value && !/^[0-9]{9}$/.test(value.replace(/\s/g, ""))) {
                    newErrors.phone = "Ingresa un número válido (9 dígitos)"
                } else {
                    delete newErrors.phone
                }
                break
        }

        setErrors(newErrors)
        return !newErrors[field]
    }

    const handleBlur = (field: string) => {
        setTouched({ ...touched, [field]: true })
        if (field === "confirmPassword") {
            validateField(field, confirmPassword)
        } else {
            validateField(field, formData[field as keyof RegisterFormData] || "")
        }
    }

    const handleChange = (field: keyof RegisterFormData, value: string) => {
        setFormData({ ...formData, [field]: value })
        if (touched[field]) {
            validateField(field, value)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validar todos los campos
        const fields = ["name", "email", "password", "confirmPassword"]
        let isValid = true

        fields.forEach((field) => {
            setTouched((prev) => ({ ...prev, [field]: true }))
            const value = field === "confirmPassword" ? confirmPassword : formData[field as keyof RegisterFormData] || ""
            if (!validateField(field, value)) {
                isValid = false
            }
        })

        if (!isValid) return

        if (!acceptedTerms || !acceptedPrivacy) {
            setErrors((prev) => ({
                ...prev,
                consents: "Debes aceptar los términos y la política de privacidad para crear tu cuenta",
            }))
            setTouched((prev) => ({ ...prev, consents: true }))
            return
        }

        registerMutation.mutate(
            {
                email: formData.email,
                password: formData.password,
                full_name: formData.name,
                phone: formData.phone || undefined,
                accepted_terms: true,
                accepted_privacy: true,
                marketing_opt_in: marketingOptIn,
            },
            {
                onSuccess: () => {
                    router.push("/login?registered=1")
                },
            }
        )
    }

    const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
        <div className="flex items-center gap-2 text-xs">
            {passed ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-muted-foreground" />}
            <span className={passed ? "text-green-500" : "text-muted-foreground"}>{label}</span>
        </div>
    )

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
                        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
                        <CardDescription>Regístrate para acceder a todas las funcionalidades</CardDescription>
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

                            {/* Nombre */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Nombre completo <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Juan Pérez"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        onBlur={() => handleBlur("name")}
                                        className={`pl-10 ${errors.name && touched.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoFocus
                                        autoComplete="name"
                                    />
                                </div>
                                {errors.name && touched.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="tu@email.com"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        onBlur={() => handleBlur("email")}
                                        className={`pl-10 ${errors.email && touched.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoComplete="email"
                                    />
                                </div>
                                {errors.email && touched.email && <p className="text-xs text-destructive">{errors.email}</p>}
                            </div>

                            {/* Teléfono (opcional) */}
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium">
                                    Teléfono <span className="text-muted-foreground text-xs">(opcional)</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="999 888 777"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        onBlur={() => handleBlur("phone")}
                                        className={`pl-10 ${errors.phone && touched.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoComplete="tel"
                                    />
                                </div>
                                {errors.phone && touched.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </div>

                            {/* Contraseña */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Contraseña <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        onBlur={() => handleBlur("password")}
                                        className={`pl-10 pr-10 ${errors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {/* Password requirements */}
                                {(touched.password || formData.password) && (
                                    <div className="grid grid-cols-2 gap-1 pt-1">
                                        <PasswordCheck passed={passwordChecks.length} label="8+ caracteres" />
                                        <PasswordCheck passed={passwordChecks.uppercase} label="Mayúscula" />
                                        <PasswordCheck passed={passwordChecks.lowercase} label="Minúscula" />
                                        <PasswordCheck passed={passwordChecks.number} label="Número" />
                                        <PasswordCheck passed={passwordChecks.special} label="Símbolo (!@#$...)" />
                                    </div>
                                )}
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium">
                                    Confirmar contraseña <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value)
                                            if (touched.confirmPassword) {
                                                validateField("confirmPassword", e.target.value)
                                            }
                                        }}
                                        onBlur={() => handleBlur("confirmPassword")}
                                        className={`pl-10 pr-10 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.confirmPassword && touched.confirmPassword && (
                                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                                )}
                            </div>

                            {/* Consentimientos LPDP (Ley 29733) */}
                            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="accepted_terms"
                                        checked={acceptedTerms}
                                        onCheckedChange={(checked) => {
                                            setAcceptedTerms(checked === true)
                                            if (errors.consents) {
                                                setErrors((prev) => {
                                                    const next = { ...prev }
                                                    delete next.consents
                                                    return next
                                                })
                                            }
                                        }}
                                        className="mt-0.5"
                                    />
                                    <label htmlFor="accepted_terms" className="text-xs leading-relaxed cursor-pointer">
                                        Acepto los{" "}
                                        <Link href="/terminos" target="_blank" className="text-[#db1a85] hover:underline">
                                            Términos de uso
                                        </Link>{" "}
                                        <span className="text-destructive">*</span>
                                    </label>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="accepted_privacy"
                                        checked={acceptedPrivacy}
                                        onCheckedChange={(checked) => {
                                            setAcceptedPrivacy(checked === true)
                                            if (errors.consents) {
                                                setErrors((prev) => {
                                                    const next = { ...prev }
                                                    delete next.consents
                                                    return next
                                                })
                                            }
                                        }}
                                        className="mt-0.5"
                                    />
                                    <label htmlFor="accepted_privacy" className="text-xs leading-relaxed cursor-pointer">
                                        Acepto la{" "}
                                        <Link href="/privacidad" target="_blank" className="text-[#db1a85] hover:underline">
                                            Política de privacidad
                                        </Link>{" "}
                                        y el tratamiento de mis datos personales conforme a la Ley 29733.{" "}
                                        <span className="text-destructive">*</span>
                                    </label>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="marketing_opt_in"
                                        checked={marketingOptIn}
                                        onCheckedChange={(checked) => setMarketingOptIn(checked === true)}
                                        className="mt-0.5"
                                    />
                                    <label htmlFor="marketing_opt_in" className="text-xs leading-relaxed cursor-pointer text-muted-foreground">
                                        Quiero recibir novedades y contenido educativo sobre mis medicamentos por correo (opcional).
                                    </label>
                                </div>

                                {errors.consents && touched.consents && (
                                    <p className="text-xs text-destructive">{errors.consents}</p>
                                )}
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
                                        Creando cuenta...
                                    </>
                                ) : (
                                    "Crear cuenta"
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
                                <span className="bg-card px-2 text-muted-foreground">¿Ya tienes cuenta?</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full bg-transparent" asChild>
                            <Link href="/login">Iniciar sesión</Link>
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

