'use client';

const AccessKey = 'lmnt_access_token';
const RefreshKey = 'lmnt_refresh_token';
const UserKey = 'lmnt_user';

export type StoredUser = { id: string; email: string };

export function setTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem(AccessKey, tokens.accessToken);
  localStorage.setItem(RefreshKey, tokens.refreshToken);
}

export function setSession(auth: { accessToken: string; refreshToken: string; user: StoredUser }) {
  setTokens({ accessToken: auth.accessToken, refreshToken: auth.refreshToken });
  localStorage.setItem(UserKey, JSON.stringify(auth.user));
}

export function getAccessToken() {
  return localStorage.getItem(AccessKey);
}

export function getRefreshToken() {
  return localStorage.getItem(RefreshKey);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(UserKey);
  if (!raw) return null;
  try {
    const u = JSON.parse(raw) as StoredUser;
    if (u?.id && u?.email) return u;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearTokens() {
  localStorage.removeItem(AccessKey);
  localStorage.removeItem(RefreshKey);
}

export function clearSession() {
  clearTokens();
  localStorage.removeItem(UserKey);
}
