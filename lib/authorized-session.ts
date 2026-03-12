import { getCookie } from "@/lib/cookie";
import { getSession, SessionData } from "@/lib/session";

export async function getAuthorizedSession(): Promise<SessionData | null> {
  const sid = await getCookie();
  if (!sid) return null;

  const session = await getSession(sid);
  if (!session || !session.data) return null;

  const { user } = session.data;
  if (
    !user ||
    typeof user.id_user !== "number" ||
    typeof user.id_profile !== "number" ||
    (user.code_language !== null && typeof user.code_language !== "string")
  ) {
    return null;
  }

  return session;
}
