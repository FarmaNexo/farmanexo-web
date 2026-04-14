"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { DrugSearch } from "@/components/drug-search"
import { ChatbotWidget } from "@/components/chatbot-widget"
import { ChatbotFAQ } from "@/components/chatbot-faq"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, MapPin, Shield, Pill, MessageCircle, Mail, Phone, Heart } from "lucide-react"
import type { Drug } from "@/lib/types"
import { Toaster } from "sonner"
import Link from "next/link"

export default function Home() {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)

  const handleDrugSelect = (drug: Drug) => {
    setIsSearching(true)
    router.push(`/buscar?medicamento=${encodeURIComponent(drug.id)}`)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" richColors />

      {/* Hero Section - Gradiente morado */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#db1a85] via-[#e14298] to-[#f062ad] py-16 sm:py-24 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
                Acceso seguro a boticas autorizadas.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-xl mb-8 text-balance">
                Compara, ahorra y cuida tu salud. Encuentra el precio más accesible para tus medicamentos comparando
                entre farmacias y recibe el acompañamiento informativo que necesitas para cumplir tu tratamiento con éxito.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-brand-coral hover:bg-brand-coral/90 text-white font-semibold px-8"
                  onClick={() => router.push("/catalogo")}
                >
                  Comparar medicamentos
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 bg-transparent"
                  onClick={() => scrollToSection("features")}
                >
                  <Shield className="mr-2 size-5" />
                  Cómo cuidamos tu seguridad
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute -bottom-8 -left-8 right-8 bg-[#b8146f] rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-coral/20 rounded-xl">
                      <Pill className="size-8 text-brand-coral" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">30+</div>
                      <div className="text-white/80">Farmacias en lista de espera</div>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm mt-4">
                    Únete a la red de farmacias que están transformando el acceso a medicamentos en el Perú
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats Card */}
          <div className="lg:hidden mt-8 bg-[#b8146f] rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-coral/20 rounded-xl">
                <Pill className="size-8 text-brand-coral" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">30+</div>
                <div className="text-white/80">Farmacias en lista de espera</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 sm:py-16 px-4 bg-brand-lavender dark:bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#db1a85] mb-2">
              Comparador Inteligente de Medicamentos
            </h2>
            <p className="text-muted-foreground">Comparar precios también es cuidar tu salud.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <DrugSearch onDrugSelect={handleDrugSelect} isLoading={isSearching} />
            <div className="text-center">
              <Button variant="outline" asChild className="bg-card hover:bg-accent border-[#db1a85]/30">
                <Link href="/catalogo">
                  <Pill className="size-4 mr-2 text-[#db1a85]" />
                  Ver catálogo completo de medicamentos
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 sm:mt-12 max-w-3xl mx-auto">
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-[#db1a85]/20 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-[#db1a85]">1000+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Medicamentos</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-[#db1a85]/20 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-[#db1a85]">50+</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Farmacias</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-[#db1a85]/20 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-brand-coral">50%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Ahorro</div>
            </div>
            <div className="text-center p-3 sm:p-4 rounded-xl bg-card border border-[#db1a85]/20 shadow-sm">
              <div className="text-2xl sm:text-3xl font-bold text-brand-success">24/7</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#db1a85]">¿Por qué elegir FarmaNexo?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto px-4">
              Tres pilares que nos hacen diferentes: Ahorro, Seguridad y Conveniencia
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-[#db1a85]/20">
              <div className="rounded-full bg-[#db1a85]/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-6 sm:size-8 text-[#db1a85]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Ahorro Garantizado</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Compara precios en tiempo real y ahorra hasta 50% con genéricos certificados. Transparencia total en
                cada búsqueda.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-[#db1a85]/20">
              <div className="rounded-full bg-brand-coral/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="size-6 sm:size-8 text-brand-coral" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Súper Conveniente</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Encuentra farmacias dentro de tu radio de búsqueda. Ver ubicación, horarios y llamar con un clic.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1 border-[#db1a85]/20">
              <div className="rounded-full bg-brand-success/10 p-4 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="size-6 sm:size-8 text-brand-success" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Información Confiable</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Datos actualizados del MINSA. Asistente IA orientador para tus dudas sobre medicamentos.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Chatbot Info Section */}
      <section id="chatbot" className="bg-brand-lavender dark:bg-muted/30 py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="rounded-full bg-[#db1a85]/10 p-3 w-12 h-12 flex items-center justify-center mb-4">
                <MessageCircle className="size-6 text-[#db1a85]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#db1a85]">Orientador Farmacéutico con IA</h2>
              <p className="text-muted-foreground mb-6 text-base sm:text-lg">
                Consulta dudas sobre uso, conservación y precauciones de medicamentos. Respuestas confiables basadas en
                información validada.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-[#db1a85] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Información sobre uso correcto de medicamentos</span>
                </li>
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-[#db1a85] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Condiciones de conservación y almacenamiento</span>
                </li>
                <li className="flex items-start gap-2">
                  <Pill className="size-5 text-[#db1a85] shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base">Advertencias generales y precauciones</span>
                </li>
              </ul>
              <p className="text-xs sm:text-sm text-muted-foreground">
                <strong>Nota importante:</strong> El chatbot proporciona información educativa general y no sustituye la
                consulta con un profesional de la salud.
              </p>
            </div>

            <div>
              <ChatbotFAQ />
            </div>
          </div>
        </div>
      </section>

      {/* Safety Banner */}
      <section className="bg-[#db1a85]/10 dark:bg-[#db1a85]/5 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 text-center">
            <Heart className="size-5 text-[#db1a85] shrink-0" />
            <p className="text-sm sm:text-base">
              <span className="font-semibold text-[#db1a85]">Comparar precios también es cuidar tu salud</span>
              <span className="text-muted-foreground ml-2">
                La información brindada tiene un enfoque preventivo y educativo. No reemplazamos la consulta médica.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Morado oscuro */}
      <footer className="bg-[#b8146f] text-white py-12 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Pill className="size-5 text-white" />
                </div>
                <span className="font-bold text-xl">FarmaNexo</span>
              </div>
              <p className="text-white/70 text-sm">
                Medicamentos seguros, precios justos y tecnología con IA para tu salud.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link href="/catalogo" className="hover:text-white transition-colors">
                    Compara
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("chatbot")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Mi Salud
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("features")}
                    className="hover:text-white transition-colors text-left"
                  >
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <Link href="/registro" className="hover:text-white transition-colors">
                    Regístrate
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Mi Cuenta
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="hover:text-white transition-colors cursor-pointer">
                  Términos y Condiciones
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Política de Privacidad
                </li>
                <li className="hover:text-white transition-colors cursor-pointer">
                  Protección de Datos de Salud
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <Mail className="size-4" />
                  contacto@farmanexo.pe
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4" />
                  +51 903 095 017
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  Lima, Perú
                </li>
              </ul>
            </div>
          </div>

          {/* Safety Note */}
          <div className="mt-10 p-4 rounded-xl bg-[#db1a85]/30 border border-white/10">
            <div className="flex items-start gap-3">
              <Pill className="size-5 text-brand-coral shrink-0 mt-0.5" />
              <p className="text-sm text-white/80">
                <span className="font-semibold text-white">Nota de seguridad:</span> La información brindada en FarmaNexo tiene un enfoque preventivo y educativo y se utiliza únicamente con fines de seguridad farmacológica. No realizamos diagnósticos médicos.
              </p>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/60">
            <p>© 2025 FarmaNexo. Todos los derechos reservados.</p>
            <p className="mt-2 text-xs">
              Construyendo un sistema farmacéutico más justo, transparente y centrado en las personas.
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  )
}


