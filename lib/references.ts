import { safeApiJson } from "@/lib/utils";

export async function fetchReferences<T>(
  reference: string,
  normalize: (data: unknown) => T[],
): Promise<T[]> {
  try {
    const res = await fetch(`/api/references?reference=${reference}`, {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    if (!res.ok) return [];

    const data = await safeApiJson<unknown>(res);
    if (!data) return [];

    return normalize(data);
  } catch {
    return [];
  }
}