export class AdminAuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function getAdminSecret(): string | null {
  const secret = process.env.MIS_ADMIN_SECRET?.trim();
  return secret || null;
}

export function assertAdminSecret(provided: string | null | undefined): void {
  const secret = getAdminSecret();
  if (!secret) {
    throw new AdminAuthError("Admin tools are not configured on this server.", 503);
  }
  if (!provided || provided !== secret) {
    throw new AdminAuthError("Invalid admin key.", 401);
  }
}

export function readAdminSecretFromRequest(request: Request): string | null {
  return request.headers.get("x-mis-admin-key");
}
