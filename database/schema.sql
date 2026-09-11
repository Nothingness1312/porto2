-- =====================================================================
--  KKARINZZZ — Cyber Security Portfolio | Supabase Schema
--  Generated from the Prisma schema (state: FINAL, after all migrations)
--  Platform : Supabase (PostgreSQL)
--  Usage    : Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--  Contains : Tables + indexes only (NO seed data, NO RLS policies)
--
--  Supabase adaptation:
--   * "id" is TEXT with DEFAULT gen_random_uuid()::text (PG13+, core) —
--     inserts via supabase-js or the SQL Editor need no explicit id.
--   * Arrays  (technologies/tools/tags)  -> TEXT[]
--   * JSON    (SiteSetting.value, ActivityLog.metadata) -> JSONB
--   * Unique natural keys added on Skill.name / Certificate.title /
--     Achievement.title / SocialLink.platform so seed-data.sql is idempotent.
-- =====================================================================

-- ============================  User  ==================================
CREATE TABLE "User" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "username"     TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- ============================  Project  ===============================
CREATE TABLE "Project" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title"        TEXT NOT NULL,
    "slug"         TEXT NOT NULL,
    "description"  TEXT NOT NULL,
    "content"      TEXT NOT NULL DEFAULT '',
    "category"     TEXT NOT NULL DEFAULT 'research',
    "featured"     BOOLEAN NOT NULL DEFAULT false,
    "published"    BOOLEAN NOT NULL DEFAULT false,
    "technologies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools"        TEXT[] DEFAULT ARRAY[]::TEXT[],
    "githubUrl"    TEXT,
    "demoUrl"      TEXT,
    "coverImage"   TEXT,
    "difficulty"   TEXT NOT NULL DEFAULT 'intermediate',
    "date"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_category_idx" ON "Project"("category");
CREATE INDEX "Project_published_idx" ON "Project"("published");
CREATE INDEX "Project_featured_idx" ON "Project"("featured");

-- ============================  Writeup  ===============================
CREATE TABLE "Writeup" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title"       TEXT NOT NULL,
    "slug"        TEXT NOT NULL,
    "excerpt"     TEXT NOT NULL,
    "content"     TEXT NOT NULL DEFAULT '',
    "category"    TEXT NOT NULL DEFAULT 'ctf',
    "difficulty"  TEXT NOT NULL DEFAULT 'medium',
    "tags"        TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published"   BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Writeup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Writeup_slug_key" ON "Writeup"("slug");
CREATE INDEX "Writeup_category_idx" ON "Writeup"("category");
CREATE INDEX "Writeup_published_idx" ON "Writeup"("published");

-- ============================  Skill  =================================
CREATE TABLE "Skill" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name"        TEXT NOT NULL,
    "category"    TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "proficiency" INTEGER NOT NULL DEFAULT 70,
    "icon"        TEXT,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE INDEX "Skill_category_idx" ON "Skill"("category");
CREATE INDEX "Skill_sortOrder_idx" ON "Skill"("sortOrder");

-- ============================  Certificate  ===========================
CREATE TABLE "Certificate" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title"       TEXT NOT NULL,
    "issuer"      TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl"    TEXT,
    "url"         TEXT,
    "date"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Certificate_title_key" ON "Certificate"("title");
CREATE INDEX "Certificate_sortOrder_idx" ON "Certificate"("sortOrder");

-- ============================  Achievement  ===========================
CREATE TABLE "Achievement" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title"         TEXT NOT NULL,
    "description"   TEXT NOT NULL DEFAULT '',
    "date"          TIMESTAMP(3) NOT NULL,
    "organization"  TEXT NOT NULL DEFAULT '',
    "type"          TEXT NOT NULL DEFAULT 'competition',
    "link"          TEXT,
    "image"         TEXT,
    "isPlaceholder" BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Achievement_title_key" ON "Achievement"("title");

-- ============================  SocialLink  ============================
CREATE TABLE "SocialLink" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "platform"  TEXT NOT NULL,
    "url"       TEXT NOT NULL,
    "username"  TEXT NOT NULL,
    "icon"      TEXT NOT NULL DEFAULT '',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SocialLink_platform_key" ON "SocialLink"("platform");
CREATE INDEX "SocialLink_sortOrder_idx" ON "SocialLink"("sortOrder");

-- ============================  SiteSetting  ===========================
CREATE TABLE "SiteSetting" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "key"       TEXT NOT NULL,
    "value"     JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key");

-- ============================  ActivityLog  ===========================
CREATE TABLE "ActivityLog" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "action"    TEXT NOT NULL,
    "entity"    TEXT NOT NULL,
    "entityId"  TEXT,
    "metadata"  JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- ============================  Message  ===============================
CREATE TABLE "Message" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "read"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");
CREATE INDEX "Message_read_idx" ON "Message"("read");