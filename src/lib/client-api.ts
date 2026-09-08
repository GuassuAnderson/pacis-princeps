export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { cache: "no-store", credentials: "same-origin", ...options });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data?.error || "Não foi possível concluir a operação. Tente novamente.");
  return data as T;
}
