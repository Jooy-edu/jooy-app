/*
  # Revert handle_new_user function to basic implementation

  1. Changes
    - Remove role handling from user metadata
    - Simplify function to only handle basic profile creation
    - Use default role from profiles table schema
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;