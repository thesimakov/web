'use client';

import { z } from 'zod';

import { getAccessToken } from '@/app/(auth)/token-store';

const ApiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/api';

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ApiProject = z.infer<typeof projectSchema>;

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? getAccessToken() : null;
  const headers = new Headers(init.headers);
  if (token) headers.set('authorization', `Bearer ${token}`);
  if (init.body != null && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return fetch(`${ApiBase}${path}`, { ...init, headers, cache: 'no-store' });
}

export async function listProjects(): Promise<ApiProject[]> {
  const res = await apiFetch('/projects', { method: 'GET' });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof json?.message === 'string' ? json.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  const parsed = z.object({ projects: z.array(projectSchema) }).safeParse(json);
  if (!parsed.success) throw new Error('Некорректный ответ сервера');
  return parsed.data.projects;
}

export async function createProject(name: string): Promise<ApiProject> {
  const res = await apiFetch('/projects', { method: 'POST', body: JSON.stringify({ name }) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof json?.message === 'string' ? json.message : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  const parsed = z.object({ project: projectSchema }).safeParse(json);
  if (!parsed.success) throw new Error('Некорректный ответ сервера');
  return parsed.data.project;
}
