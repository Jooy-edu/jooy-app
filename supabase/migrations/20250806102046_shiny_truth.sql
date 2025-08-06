/*
  # Add student role to user_role enum

  1. Database Changes
    - Add 'student' value to the existing user_role enum
    - This allows users registering through Jooy App to be assigned the 'student' role
    - Existing 'user' and 'admin' roles remain unchanged

  2. Purpose
    - Separate Jooy Studio users from Jooy App users
    - Jooy App users will be assigned 'student' role by default
    - Enables role-based access control between the two applications
*/

-- Add 'student' to the existing user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'student';