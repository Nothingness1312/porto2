// Data layer over Supabase (supabase-js) with the same public API surface
// the pages already consume. Read/write access is enforced server-side by
// Row Level Security (database/rls.sql), not by this client.

import { supabase } from "./supabase";
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

// ---------------------------------------------------------------- errors

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function fail(err: { message: string; code?: string }): never {
  const status =
    err.code === "42501" ? 403 : err.code === "PGRST301" ? 401 : 500;
  throw new ApiError(err.message, status);
}

async function run<T>(res: { data: T | null; error: { message: string; code?: string } | null }): Promise<T> {
  if (res.error) fail(res.error);
  return res.data as T;
}

// ------------------------------------------------------------- activity

async function logActivity(action: string, entity: string, entityId?: string): Promise<void> {
  try {
    const res = await supabase.from("ActivityLog").insert({ action, entity, entityId: entityId ?? null });
    if (res.error) throw new Error(res.error.message);
  } catch (err) {
    console.warn("[activity] log skipped:", err instanceof Error ? err.message : err);
  }
}

// ----------------------------------------------------------------- auth

function toUser(u: { id: string; email?: string | null; created_at: string }): User {
  return { id: u.id, username: u.email ?? "admin", createdAt: u.created_at };
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new ApiError(error.message, 401);
    const user = data.user;
    if (user.app_metadata?.role !== "admin") {
      await supabase.auth.signOut();
      throw new ApiError("Unauthorized - not an admin account", 403);
    }
    return { user: toUser(user) };
  },
  logout: async (): Promise<{ success: boolean }> => {
    await supabase.auth.signOut();
    return { success: true };
  },
  me: async (): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new ApiError("Unauthorized", 401);
    const user = data.user;
    if (user.app_metadata?.role !== "admin") throw new ApiError("Unauthorized", 403);
    return { user: toUser(user) };
  },
};

// -------------------------------------------------------------- projects

export const projectsApi = {
  list: async (params: { published?: boolean | "all"; featured?: boolean; category?: string; search?: string } = {}): Promise<Project[]> => {
    let q = supabase
      .from("Project")
      .select("*")
      .order('"featured"', { ascending: false })
      .order('"date"', { ascending: false });
    if (params.published === true) q = q.eq('"published"', true);
    if (params.published === false) q = q.eq('"published"', false);
    if (params.featured !== undefined) q = q.eq('"featured"', params.featured);
    if (params.category) q = q.eq('"category"', params.category);
    if (params.search) q = q.ilike('"title"', `%${params.search}%`);
    return run(await q);
  },
  get: async (slug: string): Promise<Project> => {
    const res = await supabase.from("Project").select("*").eq('"slug"', slug).maybeSingle();
    if (res.error) fail(res.error);
    if (!res.data) throw new ApiError("Project not found", 404);
    return res.data;
  },
  create: async (data: ProjectInput): Promise<Project> => {
    const res = await supabase
      .from("Project")
      .insert({ ...data, updatedAt: new Date().toISOString() })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "Project", created.id);
    return created;
  },
  update: async (id: string, data: Partial<ProjectInput>): Promise<Project> => {
    const res = await supabase
      .from("Project")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "Project", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Project").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "Project", id);
    return { success: true };
  },
};

// -------------------------------------------------------------- writeups

export const writeupsApi = {
  list: async (params: { published?: boolean | "all"; category?: string; search?: string } = {}): Promise<Writeup[]> => {
    let q = supabase
      .from("Writeup")
      .select("*")
      .order('"publishedAt"', { ascending: false, nullsFirst: false });
    if (params.published === true) q = q.eq('"published"', true);
    if (params.published === false) q = q.eq('"published"', false);
    if (params.category) q = q.eq('"category"', params.category);
    if (params.search) q = q.ilike('"title"', `%${params.search}%`);
    return run(await q);
  },
  get: async (slug: string): Promise<Writeup> => {
    const res = await supabase.from("Writeup").select("*").eq('"slug"', slug).maybeSingle();
    if (res.error) fail(res.error);
    if (!res.data) throw new ApiError("Writeup not found", 404);
    return res.data;
  },
  create: async (data: WriteupInput): Promise<Writeup> => {
    const now = new Date().toISOString();
    const res = await supabase
      .from("Writeup")
      .insert({ ...data, publishedAt: data.published ? now : null, updatedAt: now })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "Writeup", created.id);
    return created;
  },
  update: async (id: string, data: Partial<WriteupInput>): Promise<Writeup> => {
    const now = new Date().toISOString();
    const res = await supabase
      .from("Writeup")
      .update({ ...data, updatedAt: now, publishedAt: data.published === undefined ? undefined : data.published ? now : null })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "Writeup", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Writeup").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "Writeup", id);
    return { success: true };
  },
};

// ---------------------------------------------------------------- skills

export const skillsApi = {
  list: async (): Promise<Skill[]> => {
    const q = supabase
      .from("Skill")
      .select("*")
      .order('"category"', { ascending: true })
      .order('"sortOrder"', { ascending: true });
    return run(await q);
  },
  create: async (data: SkillInput): Promise<Skill> => {
    const res = await supabase
      .from("Skill")
      .insert({ ...data, updatedAt: new Date().toISOString() })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "Skill", created.id);
    return created;
  },
  update: async (id: string, data: Partial<SkillInput>): Promise<Skill> => {
    const res = await supabase
      .from("Skill")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "Skill", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Skill").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "Skill", id);
    return { success: true };
  },
};

// ----------------------------------------------------------- certificates

export const certificatesApi = {
  list: async (): Promise<Certificate[]> => {
    const q = supabase
      .from("Certificate")
      .select("*")
      .order('"sortOrder"', { ascending: true })
      .order('"date"', { ascending: false });
    return run(await q);
  },
  create: async (data: CertificateInput): Promise<Certificate> => {
    const res = await supabase
      .from("Certificate")
      .insert({ ...data, updatedAt: new Date().toISOString() })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "Certificate", created.id);
    return created;
  },
  update: async (id: string, data: Partial<CertificateInput>): Promise<Certificate> => {
    const res = await supabase
      .from("Certificate")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "Certificate", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Certificate").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "Certificate", id);
    return { success: true };
  },
};

// ----------------------------------------------------------- achievements

export const achievementsApi = {
  list: async (): Promise<Achievement[]> => {
    const q = supabase.from("Achievement").select("*").order('"date"', { ascending: false });
    return run(await q);
  },
  create: async (data: AchievementInput): Promise<Achievement> => {
    const res = await supabase
      .from("Achievement")
      .insert({ ...data, updatedAt: new Date().toISOString() })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "Achievement", created.id);
    return created;
  },
  update: async (id: string, data: Partial<AchievementInput>): Promise<Achievement> => {
    const res = await supabase
      .from("Achievement")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "Achievement", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Achievement").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "Achievement", id);
    return { success: true };
  },
};

// ------------------------------------------------------------ social links

export const socialsApi = {
  list: async (): Promise<SocialLink[]> => {
    const q = supabase.from("SocialLink").select("*").order('"sortOrder"', { ascending: true });
    return run(await q);
  },
  create: async (data: SocialLinkInput): Promise<SocialLink> => {
    const res = await supabase
      .from("SocialLink")
      .insert({ ...data, updatedAt: new Date().toISOString() })
      .select()
      .single();
    const created = await run(res);
    void logActivity("create", "SocialLink", created.id);
    return created;
  },
  update: async (id: string, data: Partial<SocialLinkInput>): Promise<SocialLink> => {
    const res = await supabase
      .from("SocialLink")
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('"id"', id)
      .select()
      .single();
    const updated = await run(res);
    void logActivity("update", "SocialLink", id);
    return updated;
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("SocialLink").delete().eq('"id"', id);
    await run(res);
    void logActivity("delete", "SocialLink", id);
    return { success: true };
  },
};

// ----------------------------------------------------------- site settings

export const settingsApi = {
  list: async (): Promise<SiteSetting[]> => run(await supabase.from("SiteSetting").select("*")),
  get: async (key: string): Promise<SiteSetting> => {
    const res = await supabase.from("SiteSetting").select("*").eq('"key"', key).maybeSingle();
    if (res.error) fail(res.error);
    if (!res.data) throw new ApiError("Setting not found", 404);
    return res.data;
  },
  update: async (key: string, value: unknown): Promise<SiteSetting> => {
    const res = await supabase
      .from("SiteSetting")
      .update({ value, updatedAt: new Date().toISOString() })
      .eq('"key"', key)
      .select()
      .single();
    return run(res);
  },
};

// --------------------------------------------------------------- messages

export const messagesApi = {
  list: async (): Promise<Message[]> => {
    const q = supabase.from("Message").select("*").order('"createdAt"', { ascending: false });
    return run(await q);
  },
  create: async (data: { name: string; email: string; message: string }): Promise<Message> => {
    const res = await supabase.from("Message").insert(data);
    if (res.error) fail(res.error);
    return {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
  },
  setRead: async (id: string, read: boolean): Promise<Message> => {
    const res = await supabase
      .from("Message")
      .update({ read })
      .eq('"id"', id)
      .select()
      .single();
    return run(res);
  },
  remove: async (id: string): Promise<{ success: boolean }> => {
    const res = await supabase.from("Message").delete().eq('"id"', id);
    await run(res);
    return { success: true };
  },
};

// --------------------------------------------------------------- dashboard

async function countRows(table: string, column?: string, value?: unknown): Promise<number> {
  let q = supabase.from(table).select("*", { count: "exact", head: true });
  if (column && value !== undefined) q = q.eq(column, value);
  const res = await q;
  if (res.error) fail(res.error);
  return res.count ?? 0;
}

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const [projects, writeups, skills, achievements, certificates, socialLinks, messages, unreadMessages] =
      await Promise.all([
        countRows("Project"),
        countRows("Writeup"),
        countRows("Skill"),
        countRows("Achievement"),
        countRows("Certificate"),
        countRows("SocialLink"),
        countRows("Message"),
        countRows("Message", '"read"', false),
      ]);
    const logs = await run(
      await supabase.from("ActivityLog").select("*").order('"createdAt"', { ascending: false }).limit(10)
    );
    return {
      projects,
      writeups,
      skills,
      achievements,
      certificates,
      socialLinks,
      messages,
      unreadMessages,
      recentActivity: Array.isArray(logs) ? logs : [],
    };
  },
};

// ---------------------------------------------------------------- activity

export const activityApi = {
  list: async (): Promise<ActivityLog[]> => {
    const q = supabase.from("ActivityLog").select("*").order('"createdAt"', { ascending: false }).limit(50);
    return run(await q);
  },
};