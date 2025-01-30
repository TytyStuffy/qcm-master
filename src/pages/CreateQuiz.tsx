import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { generateQuestions } from '../lib/openai';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function CreateQuiz() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop: handleFileDrop
  });

  async function handleFileDrop(acceptedFiles: File[]) {
    if (!user) return;
    
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      // Lecture du fichier
      const text = await file.text();
      
      // Sauvegarde du document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          content: text,
          user_id: user.id
        })
        .select()
        .single();

      if (docError) throw docError;

      // Génération des questions
      const questions = await generateQuestions(text);

      // Création du quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          document_id: document.id,
          user_id: user.id,
          title: `Quiz - ${file.name}`
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Sauvegarde des questions
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(
          questions.map((q: any) => ({
            quiz_id: quiz.id,
            question: q.question,
            correct_answer: q.correct_answer,
            options: q.options
          }))
        );

      if (questionsError) throw questionsError;

      toast.success('Quiz créé avec succès !');
      navigate('/quizzes');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du quiz');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Créer un nouveau quiz</h1>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="flex flex-col items-center">
            <Loader className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Génération du quiz en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-blue-600 mb-4" />
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Déposez le fichier ici...'
                : 'Glissez-déposez un fichier PDF ici, ou cliquez pour sélectionner'}
            </p>
            <p className="text-sm text-gray-500">PDF uniquement</p>
          </div>
        )}
      </div>
    </div>
  );
}