'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      signInWithGoogle: async () => {},
      logout: async () => {}
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user] = useState<null>(null);
  const [loading] = useState<boolean>(false);

  const signInWithGoogle = async (): Promise<void> => {
  try {
    // integrate Firebase here later
    console.log('Signing in with Google...');
  } catch (err) {
    console.error(err);
    throw err; 
  }
};

  const logout = async (): Promise<void> => {
    console.log('Logout disabled - Firebase not configured');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};