// filepath: frontend/src/contexts/auth-context.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { firebaseAuth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseAuth) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email, password) {
    if (!firebaseAuth) {
      throw new Error('Firebase auth is not configured.');
    }
    const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return cred.user;
  }

  async function signup(email, password) {
    if (!firebaseAuth) {
      throw new Error('Firebase auth is not configured.');
    }
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    return cred.user;
  }

  async function resetPassword(email) {
    if (!firebaseAuth) {
      throw new Error('Firebase auth is not configured.');
    }
    await sendPasswordResetEmail(firebaseAuth, email);
  }

  async function logout() {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signIn: login,
      signup,
      register: signup,
      createAccount: signup,
      resetPassword,
      sendPasswordReset: resetPassword,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
