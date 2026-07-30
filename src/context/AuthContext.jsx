import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMockMode = !auth;

  // Listen to Auth State
  useEffect(() => {
    if (isMockMode) {
      // Mock Auth State listener
      const savedUser = localStorage.getItem('nobeef_mock_current_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setLoading(false);
    } else {
      // Firebase Auth listener
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            isAnonymous: firebaseUser.isAnonymous
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, [isMockMode]);

  // Methods
  const signUpWithEmail = async (email, password) => {
    const cleanEmail = email.trim();
    if (isMockMode) {
      const mockUsers = JSON.parse(localStorage.getItem('nobeef_mock_users') || '[]');
      if (mockUsers.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
        throw new Error('Account already exists in local mock storage!');
      }
      const newUser = {
        uid: `mock_${Date.now()}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
      };
      mockUsers.push({ ...newUser, password });
      localStorage.setItem('nobeef_mock_users', JSON.stringify(mockUsers));
      localStorage.setItem('nobeef_mock_current_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } else {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      return cred.user;
    }
  };

  const loginWithEmail = async (email, password) => {
    const cleanEmail = email.trim();
    if (isMockMode) {
      const mockUsers = JSON.parse(localStorage.getItem('nobeef_mock_users') || '[]');
      const target = mockUsers.find(u => u.email.toLowerCase() === cleanEmail.toLowerCase() && u.password === password);
      if (!target) {
        throw new Error('Invalid email or password in local mock storage!');
      }
      const loggedUser = {
        uid: target.uid,
        email: target.email,
        displayName: target.displayName
      };
      localStorage.setItem('nobeef_mock_current_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return loggedUser;
    } else {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      return cred.user;
    }
  };

  const loginWithGoogle = async () => {
    if (isMockMode) {
      const newUser = {
        uid: 'mock_google_coach',
        email: 'google-coach@nobeef.app',
        displayName: 'Google Coach',
      };
      localStorage.setItem('nobeef_mock_current_user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } else {
      const cred = await signInWithPopup(auth, googleProvider);
      return cred.user;
    }
  };

  const logout = async () => {
    if (isMockMode) {
      localStorage.removeItem('nobeef_mock_current_user');
      setUser(null);
    } else {
      await signOut(auth);
    }
  };

  const value = {
    user,
    loading,
    isMockMode,
    loginWithEmail,
    signUpWithEmail,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
