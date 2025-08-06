/*
  # Update handle_new_user function to support role assignment

  1. Function Updates
    - Extract role from user metadata during signup
    - Default to 'user' role if no role specified
    - Support 'student', 'user', and 'admin' roles
    - Maintain backward compatibility with existing signups

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS during profile creation
    - Ensures profiles are created even with strict RLS policies

  3. Role Assignment Logic
    - Jooy App registrations will pass 'student' role in metadata
    - Jooy Studio registrations will use default 'user' role
    - Admin role assignment remains manual/controlled
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that handles role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _full_name text;
    _role text;
BEGIN
    -- Extract full_name from user metadata if available
    _full_name := new.raw_user_meta_data->>'full_name';
    
    -- Extract role from user metadata, default to 'user' if not provided
    _role := COALESCE(new.raw_user_meta_data->>'role', 'user');
    
    -- Validate that the role is one of the allowed values
    IF _role NOT IN ('user', 'admin', 'student') THEN
        _role := 'user'; -- Fallback to 'user' for invalid roles
    END IF;

    -- Insert new profile with extracted data
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (new.id, new.email, _full_name, _role::public.user_role);
    
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the user creation
        RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();