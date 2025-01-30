export interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  color?: string;
  user_id?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subject_id: string;
  description: string;
  created_at: string;
  user_id: string;
  document_id: string;
  total_questions: number;
  difficulty_level: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  correct_answer: string;
  options: string[];
  explanation?: string;
  latex_content?: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  incorrect_answers: {
    question_id: string;
    selected_answer: string;
  }[];
}

export interface UserStats {
  total_quizzes: number;
  average_score: number;
  subjects_mastered: number;
  current_level: number;
  xp_points: number;
  recent_activity: QuizAttempt[];
}