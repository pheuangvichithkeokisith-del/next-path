export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function isSessionNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
