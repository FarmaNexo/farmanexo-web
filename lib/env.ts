import { z } from "zod";

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

if (typeof window === "undefined" && !parsedServer.success) {
  console.error("❌ Variables de entorno inválidas:", parsedServer.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno del servidor inválida");
}

if (!parsedClient.success) {
  console.error("❌ Variables de entorno de cliente inválidas:", parsedClient.error.flatten().fieldErrors);
  throw new Error("Configuración de entorno del cliente inválida");
}

export const serverEnv = parsedServer.success ? parsedServer.data : ({} as z.infer<typeof serverSchema>);
export const clientEnv = parsedClient.data!;
export const isProd = serverEnv.NODE_ENV === "production";
