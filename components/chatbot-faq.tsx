"use client"

import { HelpCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
    {
        question: "¿Qué tipo de consultas puedo hacer?",
        answer:
            "Puedes consultar sobre el uso correcto de medicamentos, cómo conservarlos, advertencias generales y precauciones. No podemos dar diagnósticos ni prescribir tratamientos.",
    },
    {
        question: "¿El chatbot puede recetarme medicamentos?",
        answer:
            "No. El asistente solo proporciona información educativa general. Para obtener una receta o tratamiento, debes consultar con un médico o farmacéutico profesional.",
    },
    {
        question: "¿Puedo confiar en la información del chatbot?",
        answer:
            "La información se basa en fuentes validadas, pero siempre es orientativa. Para decisiones sobre tu salud, consulta con un profesional médico.",
    },
    {
        question: "¿Es seguro compartir información sobre mi salud?",
        answer:
            "En el MVP 1.0, el chatbot es anónimo y no almacena información personal de salud. Sin embargo, te recomendamos no compartir datos sensibles.",
    },
]

export function ChatbotFAQ() {
    return (
        <Card className="p-6 border-[#db1a85]/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="rounded-full bg-[#db1a85]/10 p-3">
                    <HelpCircle className="size-6 text-[#db1a85]" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Preguntas Frecuentes</h2>
                    <p className="text-sm text-muted-foreground">Sobre el asistente farmacéutico</p>
                </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </Card>
    )
}

