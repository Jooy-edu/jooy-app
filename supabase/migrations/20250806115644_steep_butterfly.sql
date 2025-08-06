/*
  # Revert handle_new_user function to basic

  1. Function Changes
    - Restore the `handle_new_user` function to its original, simple form
    - Remove role handling from user metadata
    - Only handle basic profile creation with id, email, and full_name

  2. Security
    - Maintains SECURITY DEFINER for proper permissions
    - Uses basic profile insertion without role logic
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;