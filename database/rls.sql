-- =====================================================================
--  KKARINZZZ — Row Level Security policies for Supabase
--  Usage : Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
--  Order : run AFTER schema.sql (order is safe either way)
--
--  Auth model
--   * anon (no session)        -> SELECT published case/writeup content,
--                                  SELECT all reference tables,
--                                  INSERT into "Message" (contact form)
--   * admin (authenticated + 
--     app_metadata.role=admin) -> full CRUD, message admin, activity logs
--   * "User" table is legacy (Supabase Auth replaces it) -> locked shut
--
--  Create the admin once:
--    1. Dashboard -> Authentication -> Users -> Add user (email + password)
--    2. Dashboard -> Authentication -> Users -> your admin -> Edit
--          App metadata: { "role": "admin" }
--       or via SQL:
--         update auth.users
--            set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
--          where email = 'admin@example.com';
-- =====================================================================

-- JWT helper: true only when the signed-in user carries role=admin
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- ============================  Grants  ================================
-- Explicit grants so anon/authenticated roles can reach the tables;
-- RLS policies decide what each role may actually do.
grant usage on schema public to anon, authenticated;

grant select on "Project", "Writeup", "Skill", "Certificate", "Achievement", "SocialLink", "SiteSetting" to anon;
grant select, insert, update, delete on "Project", "Writeup", "Skill", "Certificate", "Achievement", "SocialLink", "SiteSetting" to authenticated;
grant insert on "Message" to anon;
grant select, insert, update, delete on "Message" to authenticated;
grant select, insert, delete on "ActivityLog" to authenticated;

-- ============================  User  ==================================
-- Replaced by Supabase Auth. RLS on, zero policies -> deny everything.
alter table "User" enable row level security;

-- ===================  Project / Writeup (cases)  ======================
-- Public sees only published rows; admin sees every row (incl. drafts).
alter table "Project" enable row level security;
create policy "Project_public_select" on "Project" for select using ("published" = true or public.is_admin());
create policy "Project_admin_insert" on "Project" for insert with check (public.is_admin());
create policy "Project_admin_update" on "Project" for update using (public.is_admin()) with check (public.is_admin());
create policy "Project_admin_delete" on "Project" for delete using (public.is_admin());

alter table "Writeup" enable row level security;
create policy "Writeup_public_select" on "Writeup" for select using ("published" = true or public.is_admin());
create policy "Writeup_admin_insert" on "Writeup" for insert with check (public.is_admin());
create policy "Writeup_admin_update" on "Writeup" for update using (public.is_admin()) with check (public.is_admin());
create policy "Writeup_admin_delete" on "Writeup" for delete using (public.is_admin());

-- ================  Reference tables (fully public read)  ==============
alter table "Skill" enable row level security;
create policy "Skill_public_select" on "Skill" for select using (true);
create policy "Skill_admin_insert" on "Skill" for insert with check (public.is_admin());
create policy "Skill_admin_update" on "Skill" for update using (public.is_admin()) with check (public.is_admin());
create policy "Skill_admin_delete" on "Skill" for delete using (public.is_admin());

alter table "Certificate" enable row level security;
create policy "Certificate_public_select" on "Certificate" for select using (true);
create policy "Certificate_admin_insert" on "Certificate" for insert with check (public.is_admin());
create policy "Certificate_admin_update" on "Certificate" for update using (public.is_admin()) with check (public.is_admin());
create policy "Certificate_admin_delete" on "Certificate" for delete using (public.is_admin());

alter table "Achievement" enable row level security;
create policy "Achievement_public_select" on "Achievement" for select using (true);
create policy "Achievement_admin_insert" on "Achievement" for insert with check (public.is_admin());
create policy "Achievement_admin_update" on "Achievement" for update using (public.is_admin()) with check (public.is_admin());
create policy "Achievement_admin_delete" on "Achievement" for delete using (public.is_admin());

alter table "SocialLink" enable row level security;
create policy "SocialLink_public_select" on "SocialLink" for select using (true);
create policy "SocialLink_admin_insert" on "SocialLink" for insert with check (public.is_admin());
create policy "SocialLink_admin_update" on "SocialLink" for update using (public.is_admin()) with check (public.is_admin());
create policy "SocialLink_admin_delete" on "SocialLink" for delete using (public.is_admin());

alter table "SiteSetting" enable row level security;
create policy "SiteSetting_public_select" on "SiteSetting" for select using (true);
create policy "SiteSetting_admin_insert" on "SiteSetting" for insert with check (public.is_admin());
create policy "SiteSetting_admin_update" on "SiteSetting" for update using (public.is_admin()) with check (public.is_admin());
create policy "SiteSetting_admin_delete" on "SiteSetting" for delete using (public.is_admin());

-- ========================  Message (contact)  =========================
-- Public (anonymous visitors) submit the contact form; only admin reads/toggles.
alter table "Message" enable row level security;
create policy "Message_public_insert" on "Message" for insert with check (true);
create policy "Message_admin_select" on "Message" for select using (public.is_admin());
create policy "Message_admin_update" on "Message" for update using (public.is_admin()) with check (public.is_admin());
create policy "Message_admin_delete" on "Message" for delete using (public.is_admin());

-- ========================  ActivityLog  ===============================
-- Written by the admin panel (insert) and read on the dashboard.
alter table "ActivityLog" enable row level security;
create policy "ActivityLog_admin_insert" on "ActivityLog" for insert with check (public.is_admin());
create policy "ActivityLog_admin_select" on "ActivityLog" for select using (public.is_admin());
create policy "ActivityLog_admin_delete" on "ActivityLog" for delete using (public.is_admin());