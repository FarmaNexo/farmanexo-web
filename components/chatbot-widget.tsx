"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle, Send, X, Loader2, Bot, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore, initializeAuth } from "@/lib/auth-store"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
}

export function ChatbotWidget() {
    const router = useRouter()
    const { isAuthenticated, user } = useAuthStore()
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content:
                "Hola, soy el asistente farmacéutico de FarmaNexo. Puedo ayudarte con información general sobre medicamentos, su uso y conservación. ¿En qué puedo ayudarte?",
            timestamp: new Date(),
        },
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId] = useState(() => crypto.randomUUID())
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        initializeAuth()
        setMounted(true)
    }, [])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // No mostrar el widget hasta que se monte y verifique autenticación
    if (!mounted) return null

    // No mostrar el chatbot si no está autenticado
    if (!isAuthenticated) {
        return (
            <>
                {/* Botón flotante que invita a iniciar sesión */}
                <Button
                    onClick={() => router.push("/login")}
                    className="fixed bottom-6 right-6 h-auto py-3 px-4 rounded-full shadow-lg bg-[#db1a85] hover:bg-[#b8146f] text-white z-50 gap-2"
                    title="Inicia sesión para usar el asistente"
                >
                    <MessageCircle className="size-5" />
                    <span className="text-sm hidden sm:inline">Asistente IA</span>
                </Button>
            </>
        )
    }

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId,
                    userId: user?.id,
                }),
            })

            const data = await response.json()

            const assistantMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.response || data.error || "Lo siento, no pude procesar tu mensaje.",
                timestamp: new Date(),
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            console.error("Error al enviar mensaje:", error)
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.",
                timestamp: new Date(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const quickQuestions = [
        "¿Cómo debo guardar este medicamento?",
        "¿Puedo tomarlo con comida?",
        "¿Qué precauciones debo tener?",
        "¿Cómo se aplica correctamente?",
    ]

    return (
        <>
            {/* Botón flotante */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 size-14 rounded-full shadow-lg bg-[#db1a85] hover:bg-[#b8146f] text-white z-50"
                    size="icon"
                >
                    <MessageCircle className="size-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="fixed bottom-6 right-6 w-[90vw] max-w-[420px] h-[70vh] max-h-[600px] shadow-2xl z-50 flex flex-col border-2 border-[#db1a85]/20">
                    {/* Header - altura fija */}
                    <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#db1a85] to-[#e14298] text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-white p-2 shadow-sm">
                                <Bot className="size-5 text-[#db1a85]" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">Orientador Farmacéutico</h3>
                                <p className="text-xs opacity-90">Asistente IA de FarmaNexo</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 text-white size-8"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    {/* Disclaimer visible - altura fija */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 shrink-0">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-900 dark:text-amber-400 leading-relaxed">
                                Solo información educativa. No sustituye consulta médica profesional.
                            </p>
                        </div>
                    </div>

                    {/* Mensajes - altura fija con scroll */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-muted/30 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {message.role === "assistant" && (
                                    <div className="rounded-full bg-[#db1a85]/10 p-2 shrink-0 size-9 flex items-center justify-center">
                                        <Bot className="size-4 text-[#db1a85]" />
                                    </div>
                                )}

                                <div
                                    className={`rounded-2xl p-3 max-w-[75%] shadow-sm ${message.role === "user"
                                        ? "bg-[#db1a85] text-white rounded-tr-sm"
                                        : "bg-card border border-border rounded-tl-sm"
                                        }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    <p className={`text-xs mt-2 ${message.role === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                                        {message.timestamp.toLocaleTimeString("es-PE", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>

                                {message.role === "user" && (
                                    <div className="rounded-full bg-[#db1a85]/10 p-2 shrink-0 size-9 flex items-center justify-center">
                                        <User className="size-4 text-[#db1a85]" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3 justify-start">
                                <div className="rounded-full bg-[#db1a85]/10 p-2 shrink-0 size-9 flex items-center justify-center">
                                    <Bot className="size-4 text-[#db1a85]" />
                                </div>
                                <div className="rounded-2xl p-3 bg-card border border-border shadow-sm rounded-tl-sm">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="size-4 animate-spin text-[#db1a85]" />
                                        <span className="text-sm text-muted-foreground">Escribiendo...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preguntas rápidas - altura dinámica pero controlada */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-3 border-t bg-card/50 shrink-0">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Preguntas frecuentes:</p>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question) => (
                                    <Badge
                                        key={question}
                                        variant="secondary"
                                        className="cursor-pointer hover:bg-[#db1a85]/10 hover:text-[#db1a85] hover:border-[#db1a85] transition-colors text-xs py-1"
                                        onClick={() => setInput(question)}
                                    >
                                        {question}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input - altura fija */}
                    <div className="p-4 border-t bg-card shrink-0">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                type="text"
                                placeholder="Escribe tu consulta aquí..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="flex-1 focus-visible:ring-[#db1a85]"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                size="icon"
                                className="bg-[#db1a85] hover:bg-[#b8146f] text-white shrink-0 shadow-sm"
                            >
                                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </>
    )
}

