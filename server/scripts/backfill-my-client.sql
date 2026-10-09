-- One-time backfill for TreeNode."myClient".
-- Marks every direct client (a direct child of a root node) as myClient = true;
-- deeper nodes keep the column default (false).
--
-- Run ONCE per environment, AFTER `db push` has added the column and BEFORE
-- deploying the code that reads it. There is no re-run guard: running it again
-- re-flags direct clients that a user has since toggled off.
--
--   dev:  npm run prisma -- db execute --file scripts/backfill-my-client.sql
--   prod: npm run prisma:prod -- db execute --file scripts/backfill-my-client.sql
UPDATE "TreeNode" c SET "myClient" = true
FROM "TreeNode" p
WHERE c."parentId" = p.id AND p."parentId" IS NULL;
