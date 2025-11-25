# Setting the Access Code via SQL

The access code is stored directly in your database and verified by the frontend. No environment variables or Edge Functions needed!

## Step 1: Run the Migration

First, make sure you've run the migration that creates the `settings` table:

The migration file is located at: `supabase/migrations/20251126000000_add_settings_table.sql`

Run it in your Supabase SQL Editor or via your migration system.

## Step 2: Set the Access Code

Run this SQL command in your Supabase SQL Editor:

```sql
-- Set the access code to "MRP_ROCKS"
INSERT INTO public.settings (key, value, description)
VALUES ('MRP_DEALS_ACCESS_CODE', 'MRP_ROCKS', 'Secret access code to unlock premium deals')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
```

## Step 3: Verify the Code is Set

Check that the code was set correctly:

```sql
-- View the current access code
SELECT key, value, LENGTH(value) AS value_length, description, updated_at
FROM public.settings
WHERE key = 'MRP_DEALS_ACCESS_CODE';
```

You should see a row with your access code. The `value_length` helps verify there are no extra spaces.

## Updating the Access Code

To change the access code to a new value:

```sql
-- Update the access code to a new value
UPDATE public.settings
SET value = 'YOUR_NEW_CODE_HERE',
    updated_at = NOW()
WHERE key = 'MRP_DEALS_ACCESS_CODE';
```

## How It Works

1. **Frontend reads from database**: When a user enters an access code, the frontend reads `MRP_DEALS_ACCESS_CODE` directly from the `public.settings` table
2. **Client-side verification**: The frontend compares the user's input with the database value
3. **Profile update**: If the codes match, the user's `has_full_access` flag is set to `true` in their profile
4. **Immediate effect**: Changes take effect immediately - no restarts or redeployments needed

## RLS (Row Level Security)

The `settings` table has RLS enabled with the following policies:
- **Anyone can read the access code**: The `MRP_DEALS_ACCESS_CODE` is readable by anyone (needed for frontend verification)
- **Only admins can modify**: Only users with `is_admin = true` can insert, update, or delete settings

## Troubleshooting

### Code not working?

1. **Verify the code exists**:
   ```sql
   SELECT key, value FROM public.settings WHERE key = 'MRP_DEALS_ACCESS_CODE';
   ```

2. **Check for extra spaces**: The code is trimmed before comparison, but verify:
   ```sql
   SELECT key, LENGTH(value) AS length, value FROM public.settings WHERE key = 'MRP_DEALS_ACCESS_CODE';
   ```

3. **Check RLS policies**: Make sure the migration ran correctly:
   ```sql
   SELECT policyname, cmd FROM pg_policies WHERE tablename = 'settings';
   ```
   You should see a policy allowing SELECT for `MRP_DEALS_ACCESS_CODE`.

### Migration not run?

If the `settings` table doesn't exist, run the migration:
- File: `supabase/migrations/20251126000000_add_settings_table.sql`
- Run it in your Supabase SQL Editor

## Notes

- The access code is stored in plain text in the database (readable by anyone, but only admins can modify it)
- No environment variables needed - everything is managed via SQL
- No Edge Functions needed for verification - the frontend handles it directly
- Changes take effect immediately - no restarts or redeployments required
- The code comparison is case-sensitive and trimmed (leading/trailing spaces are removed)

