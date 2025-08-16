/*
  # Restore Authentication Schema

  1. New Types
    - `user_role` enum with values: user, admin, student

  2. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text, optional)
      - `role` (user_role, default 'user')
      - `created_at` (timestamp)
      - `plan_id` (uuid, optional, references credit_plans)
      - `credits_remaining` (integer, default 0)
      - `onboarding_completed` (boolean, default false)
      - `updated_at` (timestamp)

  3. Functions
    - `handle_new_user()` - Automatic profile creation on signup
    - `is_admin()` - Helper function for admin checks
    - `update_updated_at_column()` - Update timestamp trigger function

  4. Security
    - Enable RLS on `profiles` table
    - Add policies for users to manage their own profiles
    - Add policies for admins to manage all profiles

  5. Triggers
    - Auto-create profile on user signup
    - Update timestamps on profile changes

  6. Foreign Key Updates
    - Update existing tables to properly reference profiles
*/

-- Create user_role enum
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create is_admin helper function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  plan_id uuid REFERENCES credit_plans(id) ON DELETE SET NULL,
  credits_remaining integer DEFAULT 0 NOT NULL,
  onboarding_completed boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow signup profile creation"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create trigger for updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update foreign key constraints for existing tables
-- Update documents table to reference profiles instead of users
DO $$
BEGIN
  -- Check if the foreign key exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_user_id_fkey' 
    AND table_name = 'documents'
  ) THEN
    ALTER TABLE documents DROP CONSTRAINT documents_user_id_fkey;
  END IF;
  
  -- Add new foreign key constraint
  ALTER TABLE documents 
  ADD CONSTRAINT documents_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Update document_regions table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'document_regions_user_id_fkey' 
    AND table_name = 'document_regions'
  ) THEN
    ALTER TABLE document_regions DROP CONSTRAINT document_regions_user_id_fkey;
  END IF;
  
  ALTER TABLE document_regions 
  ADD CONSTRAINT document_regions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Update text_assignments table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'text_assignments_user_id_fkey' 
    AND table_name = 'text_assignments'
  ) THEN
    ALTER TABLE text_assignments DROP CONSTRAINT text_assignments_user_id_fkey;
  END IF;
  
  ALTER TABLE text_assignments 
  ADD CONSTRAINT text_assignments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Update notifications table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notifications_user_id_fkey' 
    AND table_name = 'notifications'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_user_id_fkey;
  END IF;
  
  ALTER TABLE notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Update document_texts table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'document_texts_user_id_fkey' 
    AND table_name = 'document_texts'
  ) THEN
    ALTER TABLE document_texts DROP CONSTRAINT document_texts_user_id_fkey;
  END IF;
  
  ALTER TABLE document_texts 
  ADD CONSTRAINT document_texts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;

-- Update folders table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'folders_user_id_fkey' 
    AND table_name = 'folders'
  ) THEN
    ALTER TABLE folders DROP CONSTRAINT folders_user_id_fkey;
  END IF;
  
  ALTER TABLE folders 
  ADD CONSTRAINT folders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN null;
END $$;