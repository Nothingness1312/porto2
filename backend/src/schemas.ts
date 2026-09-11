import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "username required").max(64, "username too long"),
  password: z.string().min(1, "password required").max(128, "password too long"),
});

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase kebab-case (e.g. my-project)");

export const projectInputSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema.optional(),
  description: z.string().default(""),
  content: z.string().default(""),
  category: z.string().default("research"),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  technologies: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  githubUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  // Accept both the admin form's values (beginner..expert) and legacy seed values
  // (intermediate/advanced) so editing pre-existing rows never 400s.
  difficulty: z
    .enum(["beginner", "easy", "medium", "hard", "expert", "intermediate", "advanced"])
    .default("medium"),
  date: z.coerce.date().optional(),
});

export const writeupInputSchema = z.object({
  title: z.string().min(1),
  slug: slugSchema.optional(),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  category: z.string().default("ctf"),
  difficulty: z.enum(["beginner", "medium", "hard", "insane"]).default("medium"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const skillInputSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  description: z.string().default(""),
  proficiency: z.number().min(0).max(100).default(70),
  icon: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const certificateInputSchema = z.object({
  title: z.string().min(1),
  issuer: z.string().min(1),
  description: z.string().default(""),
  imageUrl: z.string().url().optional().nullable(),
  url: z.string().url().optional().nullable(),
  date: z.coerce.date().optional(),
  sortOrder: z.number().int().default(0),
});

export const achievementInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  date: z.coerce.date(),
  organization: z.string().default(""),
  type: z.string().default("competition"),
  link: z.string().url().optional().nullable(),
  image: z.string().optional().nullable(),
  isPlaceholder: z.boolean().default(true),
});

export const socialLinkInputSchema = z.object({
  platform: z.string().min(1),
  url: z.string().min(1),
  username: z.string().default(""),
  icon: z.string().default(""),
  sortOrder: z.number().int().default(0),
});

export const settingUpdateSchema = z.object({
  value: z.unknown(),
});

export const messageInputSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  message: z.string().min(1).max(5000),
});

export const messageReadSchema = z.object({
  read: z.boolean(),
});