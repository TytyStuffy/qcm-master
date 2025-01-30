/*
  # Fix user stats and subjects tables

  1. Changes
    - Drop and recreate functions with correct parameter names
    - Add subjects table with RLS
    - Update user stats initialization
  
  2. Security
    - Enable RLS on subjects table
    - Add policies for subject management
    - Update user stats policies
*/

-- Drop existing functions first
DROP FUNCTION IF EXISTS initialize_stats_for_user(uuid);
DROP FUNCTION IF EXISTS update_user_stats_after_quiz(uuid, integer, integer, uuid);

-- Create subjects table if it doesn't exist
CREATE TABLE IF NOT EXISTS subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on subjects
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Add policies for subjects
CREATE POLICY "Users can manage their own subjects"
    ON subjects
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

-- Recreate initialize_stats_for_user function
CREATE FUNCTION initialize_stats_for_user(user_id uuid)
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

-- Recreate update_user_stats_after_quiz function
CREATE FUNCTION update_user_stats_after_quiz(
    user_id uuid,
    quiz_score integer,
    total_questions integer,
    quiz_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_stats user_stats%ROWTYPE;
    new_activity jsonb;
    score_percentage float;
BEGIN
    -- Calculate score percentage
    score_percentage := (quiz_score::float / total_questions::float) * 100;
    
    -- Create new activity entry
    new_activity := jsonb_build_object(
        'id', gen_random_uuid(),
        'quiz_id', quiz_id,
        'score', quiz_score,
        'total_questions', total_questions,
        'completed_at', now()
    );

    -- Get current stats
    SELECT * INTO current_stats FROM user_stats 
    WHERE user_stats.user_id = update_user_stats_after_quiz.user_id;

    -- Update stats
    UPDATE user_stats
    SET
        total_quizzes = total_quizzes + 1,
        average_score = ((average_score * total_quizzes) + score_percentage) / (total_quizzes + 1),
        xp_points = xp_points + quiz_score,
        current_level = GREATEST(1, floor(xp_points::float / 1000)),
        recent_activity = array_append(
            CASE 
                WHEN array_length(recent_activity, 1) >= 10 THEN recent_activity[2:10]
                ELSE recent_activity
            END,
            new_activity
        ),
        updated_at = now()
    WHERE user_stats.user_id = update_user_stats_after_quiz.user_id;
END;
$$;

-- Ensure user_stats table exists with all required columns
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_stats') THEN
        CREATE TABLE user_stats (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
            total_quizzes integer DEFAULT 0,
            average_score float DEFAULT 0,
            subjects_mastered integer DEFAULT 0,
            current_level integer DEFAULT 1,
            xp_points integer DEFAULT 0,
            recent_activity jsonb[] DEFAULT ARRAY[]::jsonb[],
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );

        ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view their own stats"
            ON user_stats
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own stats"
            ON user_stats
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
    END IF;
END $$;

-- Initialize stats for existing users
DO $$
BEGIN
    INSERT INTO user_stats (user_id)
    SELECT id FROM auth.users
    ON CONFLICT (user_id) DO NOTHING;
END $$;