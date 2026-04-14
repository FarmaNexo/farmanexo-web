import type { Mensaje } from "./types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly mensajes: Mensaje[];

  constructor(status: number, mensajes: Mensaje[], fallback = "Error inesperado") {
    const primary = mensajes[0]?.mensaje ?? fallback;
    super(primary);
    this.name = "ApiError";
    this.status = status;
    this.code = mensajes[0]?.codigo ?? "ERR_UNKNOWN";
    this.mensajes = mensajes;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isForbidden() {
    return this.status === 403;
  }

  get isValidation() {
    return this.status === 400 || this.status === 422;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}
