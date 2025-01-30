/*
  # Database Schema for Quiz System

  1. Tables
    - Documents: Stores uploaded PDF documents
    - Quizzes: Links documents to their generated quizzes
    - Questions: Stores questions for each quiz

  2. Security
    - RLS enabled on all tables
    - Policies ensure users can only access their own data
*/

-- Only create tables if they don't exist
DO $$ 
BEGIN
  -- Documents table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'documents') THEN
    CREATE TABLE documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users NOT NULL,
      title text NOT NULL,
      content text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own documents"
      ON documents
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Quizzes table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'quizzes') THEN
    CREATE TABLE quizzes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      document_id uuid REFERENCES documents ON DELETE CASCADE,
      user_id uuid REFERENCES auth.users NOT NULL,
      title text NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can manage their own quizzes"
      ON quizzes
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Questions table
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'questions') THEN
    CREATE TABLE questions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      quiz_id uuid REFERENCES quizzes ON DELETE CASCADE,
      question text NOT NULL,
      correct_answer text NOT NULL,
      options text[] NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read questions from their quizzes"
      ON questions
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM quizzes
          WHERE quizzes.id = questions.quiz_id
          AND quizzes.user_id = auth.uid()
        )
      );
  END IF;
END $$;