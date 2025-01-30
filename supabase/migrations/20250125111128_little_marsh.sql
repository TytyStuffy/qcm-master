-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES quizzes ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users NOT NULL,
    score integer NOT NULL,
    total_questions integer NOT NULL,
    time_spent integer NOT NULL,
    incorrect_answers jsonb[] DEFAULT ARRAY[]::jsonb[],
    completed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own attempts"
    ON quiz_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own attempts"
    ON quiz_attempts
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);