import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, userDetails } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">QCM Master</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" 
                className="text-gray-600">
                  Bonjour, {userDetails?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <LogIn className="h-5 w-5 mr-1" />
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus className="h-5 w-5 mr-1" />
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}