import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BarChart3, Trophy, Clock, Search, Calculator, BarChart as ChartBar, Building2, Briefcase, PieChart, Languages, Plus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { UserStats, QuizAttempt, Subject } from '../types';
import LevelBadge from '../components/LevelBadge';
import StatisticsChart from '../components/StatisticsChart';
import SearchBar from '../components/SearchBar';
import ProgressBar from '../components/ProgressBar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const defaultSubjects = [
  {
    id: 'microeconomics',
    name: 'Microéconomie',
    description: 'Principes fondamentaux de la microéconomie',
    icon: 'ChartBar',
    color: 'blue'
  },
  {
    id: 'statistics',
    name: 'Statistiques',
    description: 'Méthodes statistiques et analyse de données',
    icon: 'PieChart',
    color: 'green'
  },
  {
    id: 'national-accounting',
    name: 'Comptabilité Nationale',
    description: 'Principes de la comptabilité nationale',
    icon: 'Building2',
    color: 'purple'
  },
  {
    id: 'management',
    name: 'Management',
    description: 'Théories et pratiques du management',
    icon: 'Briefcase',
    color: 'orange'
  },
  {
    id: 'economic-calculations',
    name: 'Calculs Économiques',
    description: 'Méthodes de calcul économique',
    icon: 'Calculator',
    color: 'red'
  },
  {
    id: 'english',
    name: 'Anglais',
    description: 'Business English et communication',
    icon: 'Languages',
    color: 'indigo'
  }
];

export default function Dashboard() {
  const { user, userDetails } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', description: '' });

  useEffect(() => {
    async function loadData() {
      if (!user) return;

      try {
        // Load user stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (statsError) throw statsError;
        setStats(statsData);

        // Load subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*')
          .eq('user_id', user.id);

        if (subjectsError) throw subjectsError;
        
        // Combine default and custom subjects
        const allSubjects = [
          ...defaultSubjects,
          ...(subjectsData || []).map((s: any) => ({
            ...s,
            color: 'gray', // Custom subjects get a default color
            icon: 'BookOpen' // Custom subjects get a default icon
          }))
        ];
        
        setSubjects(allSubjects);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleAddSubject = async () => {
    if (!user || !newSubject.name) return;

    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          name: newSubject.name,
          description: newSubject.description,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setSubjects([...subjects, { ...data, color: 'gray', icon: 'BookOpen' }]);
      setNewSubject({ name: '', description: '' });
      setShowAddSubject(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du sujet:', error);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSubjectIcon = (iconName: string) => {
    const icons: { [key: string]: React.ElementType } = {
      ChartBar, PieChart, Building2, Briefcase, Calculator, Languages, BookOpen
    };
    const Icon = icons[iconName] || BookOpen;
    return Icon;
  };

  const getSubjectColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      gray: 'bg-gray-100 text-gray-600'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {userDetails?.name}
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue sur votre tableau de bord
          </p>
          <Link to="/quizzes" 
                className="text-gray-600">
                Quizzes
          </Link>
        </div>
        <LevelBadge 
          level={stats?.current_level || 1}
          xp={stats?.xp_points || 0}
          nextLevelXp={(stats?.current_level || 1) * 1000}
        />
      </div>

      <div className="mb-8">
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Rechercher un sujet, un quiz..."
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quiz complétés</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_quizzes || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Score moyen</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.average_score || 0}%</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sujets maîtrisés</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.subjects_mastered || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Sujets</h2>
            <button
              onClick={() => setShowAddSubject(!showAddSubject)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>

          <AnimatePresence>
            {showAddSubject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du sujet
                    </label>
                    <input
                      type="text"
                      value={newSubject.name}
                      onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Ex: Marketing Digital"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={newSubject.description}
                      onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Description courte du sujet"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddSubject(false)}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddSubject}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {filteredSubjects.map((subject) => {
              const Icon = getSubjectIcon(subject.icon);
              const colorClass = getSubjectColorClass(subject.color);

              return (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.id}`}
                  className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${colorClass} mr-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {subject.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-8">
          <StatisticsChart
            data={{
              labels: stats?.recent_activity.map(attempt => 
                formatDistanceToNow(new Date(attempt.completed_at), { locale: fr, addSuffix: true })
              ) || [],
              scores: stats?.recent_activity.map(attempt => 
                (attempt.score / attempt.total_questions) * 100
              ) || [],
            }}
          />

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h3>
            <div className="space-y-4">
              {stats?.recent_activity.map((attempt: QuizAttempt) => (
                <div key={attempt.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Clock className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <Link 
                        to={`/quiz/${attempt.quiz_id}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        Quiz #{attempt.quiz_id.slice(0, 8)}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(attempt.completed_at), { locale: fr, addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {Math.round((attempt.score / attempt.total_questions) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}