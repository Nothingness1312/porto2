// API client with typed methods for all backend endpoints

import type {
  Project,
  Writeup,
  Skill,
  Certificate,
  Achievement,
  SocialLink,
  SiteSetting,
  DashboardStats,
  AuthResponse,
  User,
  Message,
  ProjectInput,
  WriteupInput,
  SkillInput,
  CertificateInput,
  AchievementInput,
  SocialLinkInput,
  ActivityLog,
} from "@/types";

const API_URL = (import.meta.env.VITE_API_URL as string) || "/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ============ AUTH ============

export const authApi = {
  login: (username: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ success: boolean }>("/auth/logout", { method: "POST" }),
  me: () => request<AuthResponse>("/auth/me"),
};

// ============ PROJECTS ============

export const projectsApi = {
  list: (params?: { published?: boolean | "all"; featured?: boolean; category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.published !== undefined) qs.set("published", String(params.published));
    if (params?.featured !== undefined) qs.set("featured", String(params.featured));
    if (params?.category) qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    const q = qs.toString();
    return request<Project[]>(`/projects${q ? `?${q}` : ""}`);
  },
  get: (slug: string) => request<Project>(`/projects/${slug}`),
  create: (data: ProjectInput) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<ProjectInput>) =>
    request<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/projects/${id}`, { method: "DELETE" }),
};

// ============ WRITEUPS ============

export const writeupsApi = {
  list: (params?: { published?: boolean | "all"; category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.published !== undefined) qs.set("published", String(params.published));
    if (params?.category) qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    const q = qs.toString();
    return request<Writeup[]>(`/writeups${q ? `?${q}` : ""}`);
  },
  get: (slug: string) => request<Writeup>(`/writeups/${slug}`),
  create: (data: WriteupInput) =>
    request<Writeup>("/writeups", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<WriteupInput>) =>
    request<Writeup>(`/writeups/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/writeups/${id}`, { method: "DELETE" }),
};

// ============ SKILLS ============

export const skillsApi = {
  list: () => request<Skill[]>("/skills"),
  create: (data: SkillInput) =>
    request<Skill>("/skills", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<SkillInput>) =>
    request<Skill>(`/skills/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/skills/${id}`, { method: "DELETE" }),
};

// ============ CERTIFICATES ============

export const certificatesApi = {
  list: () => request<Certificate[]>("/certificates"),
  create: (data: CertificateInput) =>
    request<Certificate>("/certificates", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CertificateInput>) =>
    request<Certificate>(`/certificates/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/certificates/${id}`, { method: "DELETE" }),
};

// ============ ACHIEVEMENTS ============

export const achievementsApi = {
  list: () => request<Achievement[]>("/achievements"),
  create: (data: AchievementInput) =>
    request<Achievement>("/achievements", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<AchievementInput>) =>
    request<Achievement>(`/achievements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/achievements/${id}`, { method: "DELETE" }),
};

// ============ SOCIAL LINKS ============

export const socialsApi = {
  list: () => request<SocialLink[]>("/social-links"),
  create: (data: SocialLinkInput) =>
    request<SocialLink>("/social-links", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<SocialLinkInput>) =>
    request<SocialLink>(`/social-links/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/social-links/${id}`, { method: "DELETE" }),
};

// ============ SITE SETTINGS ============

export const settingsApi = {
  list: () => request<SiteSetting[]>("/site-settings"),
  get: (key: string) => request<SiteSetting>(`/site-settings/${key}`),
  update: (key: string, value: unknown) =>
    request<SiteSetting>(`/site-settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    }),
};

// ============ MESSAGES ============

export const messagesApi = {
  list: () => request<Message[]>("/messages"),
  create: (data: { name: string; email: string; message: string }) =>
    request<Message>("/messages", { method: "POST", body: JSON.stringify(data) }),
  setRead: (id: string, read: boolean) =>
    request<Message>(`/messages/${id}`, { method: "PATCH", body: JSON.stringify({ read }) }),
  remove: (id: string) =>
    request<{ success: boolean }>(`/messages/${id}`, { method: "DELETE" }),
};

// ============ DASHBOARD ============

export const dashboardApi = {
  stats: () => request<DashboardStats>("/admin/dashboard/stats"),
};

// ============ ACTIVITY ============

export const activityApi = {
  list: () => request<ActivityLog[]>("/activity"),
};

export { ApiError };
export default request;