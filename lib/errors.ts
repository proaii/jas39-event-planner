export type ApiError = { code: string; message: string; hint?: string };

export function toApiError(e: unknown, fallback = 'UNKNOWN'): ApiError {
  if (typeof e === 'object' && e !== null) {
    const err = e as Record<string, unknown>;

    const code =
      typeof err.code === 'string'
        ? err.code
        : typeof err.status === 'string' || typeof err.status === 'number'
        ? String(err.status)
        : fallback;

    const message =
      typeof err.message === 'string'
        ? err.message
        : 'Unknown error occurred';

    const hint = typeof err.hint === 'string' ? err.hint : undefined;

    return { code, message, hint };
  }

  if (typeof e === 'string') return { code: fallback, message: e };

  if (e instanceof Error) return { code: fallback, message: e.message };

  return { code: fallback, message: 'Unknown error' };
}

export function jsonError(e: unknown, init?: number) {
  const a = toApiError(e);
  return Response.json(a, { status: init ?? 400 });
}
