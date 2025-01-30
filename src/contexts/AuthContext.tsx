import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userDetails: { name: string } | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userDetails: null,
});

// Add the useAuth hook export
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from any existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserDetails({
          name: session.user.user_metadata.name || 'Utilisateur'
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserDetails({
          name: session.user.user_metadata.name || 'Utilisateur'
        });
      } else {
        setUser(null);
        setUserDetails(null);
      }
      setLoading(false);

      // Handle auth events
      if (event === 'SIGNED_OUT') {
        toast.success('Déconnexion réussie');
      } else if (event === 'SIGNED_IN') {
        toast.success('Connexion réussie');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, userDetails }}>
      {children}
    </AuthContext.Provider>
  );
}