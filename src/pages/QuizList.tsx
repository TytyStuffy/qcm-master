import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, ChevronRight, Plus, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';

interface Quiz {
  id: string;
  title: string;
  created_at: string;
  description?: string;
  subject_id?: string;
  difficulty_level?: number;
  total_questions: number;
}

interface Subject {
  id: string;
  name: string;
}

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        // Load quizzes
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select(`
            *,
            questions (count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quizzesError) throw quizzesError;

        // Load subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('id, name')
          .order('name');

        if (subjectsError) throw subjectsError;

        setQuizzes(quizzesData || []);
        setFilteredQuizzes(quizzesData || []);
        setSubjects(subjectsData || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des quiz');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSearch = (query: string) => {
    let filtered = quizzes;
    
    if (query) {
      filtered = filtered.filter(quiz =>
        quiz.title.toLowerCase().includes(query.toLowerCase()) ||
        (quiz.description && quiz.description.toLowerCase().includes(query.toLowerCase()))
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(quiz => quiz.subject_id === selectedSubject);
    }

    setFilteredQuizzes(filtered);
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    let filtered = quizzes;

    if (subjectId !== 'all') {
      filtered = filtered.filter(quiz => quiz.subject_id === subjectId);
    }

    setFilteredQuizzes(filtered);
  };

  const getDifficultyLabel = (level: number) => {
    switch (level) {
      case 1: return 'Débutant';
      case 2: return 'Intermédiaire';
      case 3: return 'Avancé';
      default: return 'Non défini';
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'text-green-600 bg-green-50';
      case 2: return 'text-yellow-600 bg-yellow-50';
      case 3: return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes Quiz</h1>
        <Link
          to="/create-quiz"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Quiz
        </Link>
      </div>

      <div className="mb-6 space-y-4">
        <SearchBar 
          onSearch={handleSearch}
          placeholder="Rechercher un quiz..."
        />

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSubjectChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedSubject === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Tous les sujets
          </button>
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSubjectChange(subject.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${selectedSubject === subject.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun quiz disponible</h3>
          <p className="text-gray-500">Commencez par créer votre premier quiz</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y">
          {filteredQuizzes.map((quiz) => (
            <Link
              key={quiz.id}
              to={`/quiz/${quiz.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(quiz.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {quiz.difficulty_level && (
                      <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty_level)}`}>
                        {getDifficultyLabel(quiz.difficulty_level)}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {quiz.total_questions} questions
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}