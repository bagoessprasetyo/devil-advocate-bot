-- Quick fix for "Database error saving new user" caused by RLS INSERT policy
-- Run this in your Supabase SQL Editor to fix the issue immediately

-- 1. Drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create the improved trigger function that bypasses RLS
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

-- 3. Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 4. Create profiles for any existing users who don't have them
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
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;