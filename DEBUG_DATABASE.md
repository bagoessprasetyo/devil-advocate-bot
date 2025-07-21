# Database Debugging Guide

If you're getting "Database error saving new user", run these SQL queries in your Supabase SQL Editor to debug:

## 1. Check if profiles table exists and has correct structure

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

## 2. Check if the trigger function exists

```sql
-- Check if trigger function exists
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';
```

## 3. Check if the trigger is active

```sql
-- Check if trigger exists and is enabled
SELECT trigger_name, event_manipulation, action_statement, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

## 4. Test the trigger function manually

```sql
-- Check what happens when we try to insert a test user
-- (Don't actually run this, just check the syntax)
SELECT handle_new_user();
```

## 5. Check existing users and profiles

```sql
-- See all auth users
SELECT id, email, created_at, raw_user_meta_data 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- See all profiles
SELECT id, email, full_name, avatar_url, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Check for users without profiles
SELECT u.id, u.email, u.created_at as user_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## 6. Fix Missing Profiles

If you find users without profiles, run this to create them:

```sql
-- Create missing profiles for existing users
INSERT INTO profiles (id, email, full_name, avatar_url, credits_remaining, subscription_tier)
SELECT 
    u.id,
    u.email,
    COALESCE(
        u.raw_user_meta_data->>'full_name', 
        u.raw_user_meta_data->>'name', 
        split_part(COALESCE(u.email, ''), '@', 1)
    ) as full_name,
    COALESCE(
        u.raw_user_meta_data->>'avatar_url', 
        u.raw_user_meta_data->>'picture'
    ) as avatar_url,
    5 as credits_remaining,
    'free' as subscription_tier
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

## 7. Re-create the trigger (if needed)

If the trigger is missing or broken, run this:

```sql
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the improved function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## 8. Check RLS Policies

Make sure Row Level Security policies are correct:

```sql
-- Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if RLS is enabled on profiles table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

## 9. Test RLS INSERT Policy

Test if the INSERT policy is blocking the trigger:

```sql
-- This should show the current auth context
SELECT auth.uid(), session_user, current_user;

-- Try to insert a test profile (this might fail due to RLS)
-- DON'T actually run this, just to understand the issue
-- INSERT INTO profiles (id, email, full_name) 
-- VALUES ('test-id', 'test@example.com', 'Test User');
```

## 10. Fix RLS INSERT Issue

If RLS is blocking the trigger, update the trigger function to bypass RLS:

```sql
-- Drop and recreate the trigger function with RLS bypass
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Bypass RLS for this INSERT since we're in a trusted trigger context
  PERFORM set_config('row_security', 'off', true);
  
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url', 
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();
  
  -- Re-enable RLS
  PERFORM set_config('row_security', 'on', true);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-enable RLS even in case of error
    PERFORM set_config('row_security', 'on', true);
    -- Log the error but don't fail the auth process
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## Common Issues and Solutions

1. **"relation public.profiles does not exist"**: Run the table creation SQL from SUPABASE_SETUP.md
2. **"permission denied" or "Database error saving new user"**: Most likely RLS INSERT policy is blocking the trigger function - run the RLS fix from section 10 above
3. **"duplicate key value violates unique constraint"**: The trigger is trying to create a profile that already exists - this should be handled by the ON CONFLICT clause
4. **"column does not exist"**: Check that all columns in the profiles table match the schema in SUPABASE_SETUP.md
5. **"new row violates row-level security policy"**: RLS INSERT policy is too restrictive - the trigger function needs to bypass RLS as shown in section 10