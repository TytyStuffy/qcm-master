import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, Award } from 'lucide-react';
import { Quiz } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuizCardProps {
  quiz: Quiz;
  index: number;
}

export default function QuizCard({ quiz, index }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
    >
      <Link to={`/quiz/${quiz.id}`} className="block p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{quiz.description}</p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {quiz.total_questions} questions
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(quiz.created_at), { locale: fr, addSuffix: true })}
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Niveau {quiz.difficulty_level}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}