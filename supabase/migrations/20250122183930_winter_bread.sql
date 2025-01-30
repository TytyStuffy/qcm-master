/*
  # Création des tables pour le système de quiz

  1. Nouvelles Tables
    - `documents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `quizzes`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `created_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `quiz_id` (uuid, foreign key)
      - `question` (text)
      - `correct_answer` (text)
      - `options` (text[])
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Documents table
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

-- Quizzes table
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

-- Questions table
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