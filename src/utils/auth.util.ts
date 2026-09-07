export interface CurrentUser {
  id: number;
  username: string;
}

export const getUserFromToken = (): CurrentUser | null => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized));

    if (typeof payload.id !== "number" || typeof payload.username !== "string") {
      return null;
    }

    if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
      return null;
    }

    return { id: payload.id, username: payload.username };
  } catch {
    return null; 
  }
};