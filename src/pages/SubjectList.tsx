import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Subject } from '../types';
import SubjectCard from '../components/SubjectCard';
import SearchBar from '../components/SearchBar';

export default function SubjectList() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    async function loadSubjects() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('name');

        if (error) throw error;
        setSubjects(data || []);
        setFilteredSubjects(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des sujets:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, [user]);

  const handleSearch = (query: string) => {
    const filtered = subjects.filter(subject =>
      subject.name.toLowerCase().includes(query.toLowerCase()) ||
      subject.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSubjects(filtered);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Sujets disponibles</h1>
        <SearchBar onSearch={handleSearch} placeholder="Rechercher un sujet..." />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}