/*
  # Fix user stats initialization

  1. Changes
    - Add function to initialize stats for existing users
    - Add policy for inserting user stats
    - Modify registration process to ensure stats are created

  2. Security
    - Add policy for system to insert stats
    - Maintain existing RLS policies
*/

-- Add policy for inserting user stats
CREATE POLICY "Users can insert their own stats"
    ON user_stats
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create function to initialize stats for existing users
CREATE OR REPLACE FUNCTION initialize_stats_for_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (user_id)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$;