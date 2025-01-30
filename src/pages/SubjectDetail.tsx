import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Subject, Quiz } from '../types';
import QuizCard from '../components/QuizCard';
import SearchBar from '../components/SearchBar';
import StatisticsChart from '../components/StatisticsChart';
import { BookOpen, Users, Clock } from 'lucide-react';

export default function SubjectDetail() {
  const { subjectId } = useParams();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalAttempts: 0,
    timeSpent: 0,
  });

  useEffect(() => {
    async function loadSubjectData() {
      if (!subjectId) return;

      try {
        // Load subject details
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .eq('id', subjectId)
          .single();

        if (subjectError) throw subjectError;
        setSubject(subjectData);

        // Load quizzes for this subject
        const { data: quizzesData, error: quizzesError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('subject_id', subjectId)
          .order('created_at', { ascending: false });

        if (quizzesError) throw quizzesError;
        setQuizzes(quizzesData || []);
        setFilteredQuizzes(quizzesData || []);

        // Load subject statistics
        const { data: statsData, error: statsError } = await supabase
          .from('subject_stats')
          .select('*')
          .eq('subject_id', subjectId)
          .single();

        if (statsError) throw statsError;
        setStats(statsData || {
          totalQuizzes: 0,
          averageScore: 0,
          totalAttempts: 0,
          timeSpent: 0,
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubjectData();
  }, [subjectId]);

  const handleSearch = (query: string) => {
    const filtered = quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(query.toLowerCase()) ||
      quiz.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredQuizzes(filtered);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{subject?.name}</h1>
        <p className="text-gray-600 mb-6">{subject?.description}</p>
        <SearchBar onSearch={handleSearch} placeholder="Rechercher un quiz..." />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Quiz disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tentatives totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttempts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Temps total</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(stats.timeSpent / 60)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <StatisticsChart
          data={{
            labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
            scores: [65, 70, 75, 80, 85, 90],
          }}
        />

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progression du niveau
          </h3>
          {/* Add level progression visualization here */}
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuizzes.map((quiz, index) => (
          <QuizCard key={quiz.id} quiz={quiz} index={index} />
        ))}
      </div>
    </div>
  );
}