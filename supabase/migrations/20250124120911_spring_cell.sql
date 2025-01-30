/*
  # Create user statistics tables and functions

  1. New Tables
    - `user_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `total_quizzes` (integer)
      - `average_score` (float)
      - `subjects_mastered` (integer)
      - `current_level` (integer)
      - `xp_points` (integer)
      - `recent_activity` (jsonb array of quiz attempts)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_stats` table
    - Add policies for users to read their own stats
    - Add policies for system to update stats

  3. Functions
    - Function to initialize user stats on user creation
    - Function to update stats after quiz completion
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
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

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats"
    ON user_stats
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create function to initialize user stats
CREATE OR REPLACE FUNCTION initialize_user_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_stats (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Create trigger to initialize stats for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_stats();

-- Create function to update user stats after quiz completion
CREATE OR REPLACE FUNCTION update_user_stats_after_quiz(
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
    SELECT * INTO current_stats FROM user_stats WHERE user_stats.user_id = update_user_stats_after_quiz.user_id;

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