/** Убирает markdown-ограждения вокруг JSON из ответа LLM. */
export function stripJsonFence(raw: string): string {
  const t = raw.trim();
  const m = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(t);
  if (m) {
    return m[1].trim();
  }
  return t;
}
