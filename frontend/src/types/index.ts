// Shared API types matching the backend Prisma schema

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  featured: boolean;
  published: boolean;
  technologies: string[];
  tools: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  coverImage?: string | null;
  difficulty: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Writeup {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  difficulty: string;
  tags: string[];
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  proficiency: number;
  icon?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  description: string;
  imageUrl?: string | null;
  url?: string | null;
  date: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  organization: string;
  type: string;
  link?: string | null;
  image?: string | null;
  isPlaceholder: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  username: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  metadata?: unknown | null;
  createdAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
}

export interface DashboardStats {
  projects: number;
  writeups: number;
  skills: number;
  achievements: number;
  certificates: number;
  socialLinks: number;
  messages: number;
  unreadMessages: number;
  recentActivity: ActivityLog[];
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProjectInput = Omit<
  Project,
  "id" | "createdAt" | "updatedAt"
>;
export type WriteupInput = Omit<
  Writeup,
  "id" | "createdAt" | "updatedAt" | "publishedAt"
>;
export type SkillInput = Omit<Skill, "id" | "createdAt" | "updatedAt">;
export type CertificateInput = Omit<
  Certificate,
  "id" | "createdAt" | "updatedAt"
>;
export type AchievementInput = Omit<
  Achievement,
  "id" | "createdAt" | "updatedAt"
>;
export type SocialLinkInput = Omit<
  SocialLink,
  "id" | "createdAt" | "updatedAt"
>;