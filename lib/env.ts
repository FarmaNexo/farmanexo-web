import { z } from "zod";

// Skip validation durante `next build` (analisis estatico no necesita env reales).
// En runtime (next start / node server.js) NEXT_PHASE != phase-production-build
// -> validacion estricta se aplica normalmente y falla fast si falta algo.
const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

const serverSchema = z.object({
  API_GATEWAY_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET debe tener al menos 32 caracteres"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

const parsedServer = serverSchema.safeParse({
  API_GATEWAY_URL: process.env.API_GATEWAY_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});

const parsedClient = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

// Validar solo en runtime (no durante next build)
if (!IS_BUILD) {
  if (typeof window === "undefined" && !parsedServer.success) {
    console.error("❌ Variables de entorno inválidas:", parsedServer.error.flatten().fieldErrors);
    throw new Error("Configuración de entorno del servidor inválida");
  }

  if (!parsedClient.success) {
    console.error("❌ Variables de entorno de cliente inválidas:", parsedClient.error.flatten().fieldErrors);
    throw new Error("Configuración de entorno del cliente inválida");
  }
}

export const serverEnv = parsedServer.success ? parsedServer.data : ({} as z.infer<typeof serverSchema>);
export const clientEnv = parsedClient.success ? parsedClient.data : ({} as z.infer<typeof clientSchema>);
export const isProd = serverEnv.NODE_ENV === "production";
