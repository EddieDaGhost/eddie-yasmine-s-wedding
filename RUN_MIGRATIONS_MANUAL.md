# How to Run Database Migrations Manually

Since Supabase CLI requires login, here's the easiest way to run the migrations:

## Step 1: Go to Supabase SQL Editor

Open this link in your browser:
https://supabase.com/dashboard/project/hxvydccjwfnbyrzwybsz/sql/new

## Step 2: Run Migration 1 - RLS Policies

1. Copy the ENTIRE contents from: `supabase/migrations/20260215000000_add_rls_policies.sql`
2. Paste into the SQL Editor
3. Click **RUN** button (or press Ctrl+Enter)
4. You should see "Success. No rows returned"

## Step 3: Run Migration 2 - Rate Limiting

1. Copy the ENTIRE contents from: `supabase/migrations/20260215000001_add_rate_limiting.sql`
2. Paste into the SQL Editor (replace the previous content)
3. Click **RUN** button
4. You should see "Success. No rows returned"

## Step 4: Verify Everything Worked

Run this query in SQL Editor to check RLS is enabled:

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('rsvps', 'guestbook_messages', 'photos', 'content');
```

You should see all tables with `rowsecurity = true`

Run this to check policies exist:

```sql
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

You should see multiple policies for each table.

## Troubleshooting

### Error: "policy already exists"
This means the policy was already created. You can either:
- Ignore it (it's fine)
- Drop the policy first: `DROP POLICY policy_name ON table_name;`

### Error: "table does not exist"
Check the table name - it might be slightly different in your database.

### Error: "permission denied"
Make sure you're logged into Supabase as the project owner.

## What These Migrations Do

**Migration 1 (RLS Policies):**
- Locks down database access
- Only admins can view RSVPs, all messages, all photos
- Public can only submit data and view approved content

**Migration 2 (Rate Limiting):**
- Prevents spam
- Limits: 5 RSVPs/hour, 3 messages/hour, 10 photos/hour
- Uses database triggers

## After Running Migrations

1. Test RSVP submission (should work)
2. Try submitting 6 RSVPs rapidly (6th should fail)
3. Test admin login (should work)
4. Check `PHASE1_COMPLETE.md` for full testing checklist

## Need Help?

If you encounter errors, send me:
1. The error message
2. Which migration you were running
3. Screenshot of SQL Editor if possible
