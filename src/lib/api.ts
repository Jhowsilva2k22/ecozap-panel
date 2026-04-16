const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://web-production-ae1319.up.railway.app";

async function request(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined"
      ? (await import("./supabase")).supabase.auth
          .getSession()
          .then((s) => s.data.session?.access_token)
      : null;

  const jwt = await token;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
    throw new Error(err.detail || `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  getTenant: () => request("/api/tenant/me"),
  getStats: () => request("/api/tenant/stats"),
  updateProfile: (data: Record<string, string>) =>
    request("/api/tenant/profile", { method: "PUT", body: JSON.stringify(data) }),
  setupBot: (data: Record<string, string>) =>
    request("/api/tenant/bot", { method: "PUT", body: JSON.stringify(data) }),
  connectWhatsApp: (phone?: string) =>
    request("/api/tenant/connect-whatsapp", {
      method: "POST",
      body: JSON.stringify({ phone_number: phone || null }),
    }),
  whatsappStatus: () => request("/api/tenant/whatsapp-status"),
  addKnowledge: (links: string[]) =>
    request("/api/tenant/knowledge", { method: "POST", body: JSON.stringify({ links }) }),
  getCustomers: (limit = 50, offset = 0, status?: string) => {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (status) params.set("status", status);
    return request(`/api/tenant/customers?${params}`);
  },
};
