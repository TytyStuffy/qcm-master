import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Upload, BookOpen, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenue sur QCM Master
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Votre système de QCM pour apprendre aux mieux vos cours de Licence Economie et Gestion
        </p>
        <Link
          to="/register"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Commencer gratuitement
        </Link>
      </section>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">1. Téléchargez votre PDF</h2>
          </div>
          <p className="text-gray-600">
            Importez vos supports de cours au format PDF. Notre système analysera automatiquement le contenu pour créer des questions pertinentes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">2. Générez des QCM</h2>
          </div>
          <p className="text-gray-600">
            Les questions à choix multiples sont générées automatiquement à partir du contenu de votre document, avec des réponses pertinentes.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">3. Répondez aux quiz</h2>
          </div>
          <p className="text-gray-600">
            Testez vos connaissances en répondant aux questions générées. Naviguez facilement entre les questions et soumettez vos réponses.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">4. Suivez vos progrès</h2>
          </div>
          <p className="text-gray-600">
            Consultez vos scores, révisez vos erreurs et suivez votre progression dans le temps pour améliorer vos résultats.
          </p>
        </div>
      </div>

      <section className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Fonctionnalités principales
        </h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
            Génération automatique de questions à partir de vos PDF
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
            Interface intuitive et moderne
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
            Suivi détaillé de votre progression
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
            Accès à l'historique de vos quiz
          </li>
          <li className="flex items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full mr-3"></div>
            Révision des questions manquées
          </li>
        </ul>
      </section>
    </div>
  );
}