import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Question, Quiz } from '../types';
import toast from 'react-hot-toast';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import ProgressBar from '../components/ProgressBar';

export default function QuizView() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());
  const [showExplanation, setShowExplanation] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<{
    question_id: string;
    selected_answer: string;
  }[]>([]);

  useEffect(() => {
    async function loadQuiz() {
      if (!user || !quizId) return;

      try {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData);

        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_id', quizId);

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement du quiz:', error);
        toast.error('Erreur lors du chargement du quiz');
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId, user, navigate]);

  const handleAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestion].correct_answer;

    if (!isCorrect) {
      setIncorrectAnswers([...incorrectAnswers, {
        question_id: questions[currentQuestion].id,
        selected_answer: answer
      }]);
    }

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowExplanation(true);
  };

  const handleNext = async () => {
    if (selectedAnswer === null) return;

    setShowExplanation(false);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);

      try {
        // Save the quiz attempt
        const { error: attemptError } = await supabase
          .from('quiz_attempts')
          .insert({
            quiz_id: quizId,
            user_id: user?.id,
            score,
            total_questions: questions.length,
            time_spent: timeSpent,
            incorrect_answers: incorrectAnswers
          });

        if (attemptError) throw attemptError;

        // Update user stats
        const { error: statsError } = await supabase.rpc(
          'update_user_stats_after_quiz',
          {
            input_user_id: user?.id,
            quiz_score: score,
            total_questions: questions.length,
            quiz_id: quizId
          }
        );

        if (statsError) throw statsError;
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement de la tentative:', error);
        toast.error('Erreur lors de l\'enregistrement du résultat');
      }

      setShowResult(true);
    }
  };

  // Rest of the component remains the same...
  // (Previous JSX and rendering logic)
}