import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe tener una mayúscula")
    .regex(/[a-z]/, "Debe tener una minúscula")
    .regex(/[0-9]/, "Debe tener un número"),
  full_name: z.string().min(3, "Mínimo 3 caracteres"),
  phone: z.string().min(7, "Mínimo 7 dígitos").optional().or(z.literal("")),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
