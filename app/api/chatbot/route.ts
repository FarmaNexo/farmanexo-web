// Chatbot temporalmente deshabilitado durante la migracion de Vercel a AWS.
// Se reactivara en una fase posterior con @ai-sdk/openai + OPENAI_API_KEY
// desde Secrets Manager. El fallback a Vercel AI Gateway ya no funciona.

export const runtime = "nodejs"

export async function POST() {
    return Response.json(
        {
            response:
                "El chatbot esta temporalmente fuera de servicio mientras migramos la infraestructura. Mientras tanto, te recomendamos consultar con un farmaceutico profesional.\n\n⚠️ Esta informacion es orientativa y no sustituye la evaluacion de un profesional de la salud.",
            error: "chatbot_unavailable",
        },
        { status: 503 },
    )
}
