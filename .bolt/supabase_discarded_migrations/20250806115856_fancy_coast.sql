/*
  # Comprehensive Authentication System

  1. New Tables
    - `profiles` - Extended user profiles with roles and metadata
    - `user_sessions` - Track active user sessions for security
    - `password_reset_tokens` - Secure password reset functionality
    - `login_attempts` - Rate limiting and security monitoring

  2. Security Features
    - Row Level Security (RLS) enabled on all tables
    - Comprehensive policies for data access control
    - Rate limiting for login attempts
    - Secure password reset token management
    - User role system (user, admin)

  3. Functions
    - `handle_new_user()` - Automatic profile creation on signup
    - `cleanup_expired_tokens()` - Remove expired reset tokens
    - `check_rate_limit()` - Prevent brute force attacks
    - `is_admin()` - Helper function for admin checks

  4. Triggers
    - Auto-create profile on user signup
    - Update timestamps on profile changes
*/

-- Create user_role enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create profiles table with comprehensive user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  email_verified boolean DEFAULT false NOT NULL,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create user_sessions table for session tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  last_accessed_at timestamptz DEFAULT now() NOT NULL
);

-- Create password_reset_tokens table for secure password resets
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_hash text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create login_attempts table for rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  success boolean NOT NULL,
  attempted_at timestamptz DEFAULT now() NOT NULL,
  user_agent text
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'::user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(user_email text, client_ip inet)
RETURNS boolean AS $$
DECLARE
  attempt_count integer;
BEGIN
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*) INTO attempt_count
  FROM login_attempts
  WHERE email = user_email 
    AND ip_address = client_ip
    AND success = false
    AND attempted_at > now() - interval '15 minutes';
  
  -- Allow if less than 5 failed attempts
  RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, email_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE((new.raw_user_meta_data->>'email_verified')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  -- Remove expired password reset tokens
  DELETE FROM password_reset_tokens 
  WHERE expires_at < now();
  
  -- Remove expired sessions
  DELETE FROM user_sessions 
  WHERE expires_at < now();
  
  -- Remove old login attempts (older than 24 hours)
  DELETE FROM login_attempts 
  WHERE attempted_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for user_sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON user_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- RLS Policies for password_reset_tokens
CREATE POLICY "Users can view their own reset tokens"
  ON password_reset_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage reset tokens"
  ON password_reset_tokens FOR ALL
  TO service_role
  USING (true);

-- RLS Policies for login_attempts
CREATE POLICY "Admins can view all login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage login attempts"
  ON login_attempts FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_ip ON login_attempts(email, ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);