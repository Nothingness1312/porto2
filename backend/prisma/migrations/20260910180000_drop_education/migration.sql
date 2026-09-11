-- Drop Education feature (removed from product scope)
DROP TABLE IF EXISTS "Education";

-- Remove stale activity logs pointing at the deleted entity
DELETE FROM "ActivityLog" WHERE "entity" = 'education';