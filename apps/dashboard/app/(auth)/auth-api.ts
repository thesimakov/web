import { z } from 'zod';

const ApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

export const AuthResponseSchema = z.object({
  user: z.object({ id: z.string(), email: z.string() }),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

async function postJson(path: string, body: unknown) {
  const res = await fetch(`${ApiBase}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof json?.message === 'string'
        ? json.message
        : Array.isArray(json?.message)
          ? json.message.join(', ')
          : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function signup(email: string, password: string) {
  return await postJson('/auth/signup', { email, password });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return AuthResponseSchema.parse(await postJson('/auth/login', { email, password }));
}

export async function logout(refreshToken: string) {
  return await postJson('/auth/logout', { refreshToken });
}

