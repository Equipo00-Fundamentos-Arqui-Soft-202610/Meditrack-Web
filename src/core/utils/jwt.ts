export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenUserId(token: string): number | null {
  const payload = decodeJwt(token);
  if (!payload?.sub) return null;
  const id = Number(payload.sub);
  return isNaN(id) ? null : id;
}

export function getTokenUserRole(token: string): string | null {
  return decodeJwt(token)?.role ?? null;
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
