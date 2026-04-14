export type MensajeTipo = "information" | "warning" | "error" | "success";

export interface Mensaje {
  codigo: string;
  mensaje: string;
  tipo: MensajeTipo;
}

export interface Meta {
  mensajes: Mensaje[];
  idTransaccion: string;
  resultado: boolean;
  timestamp: string;
}

export interface ApiResponse<T> {
  meta: Meta;
  datos: T;
}

export interface LoginResponseDTO {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface RegisterResponseDTO {
  user_id: string;
  email: string;
  message: string;
  created_at: string;
}

export interface ProfileResponseDTO {
  user_id: string;
  email?: string;
  role: string;
  full_name: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at: string;
}
