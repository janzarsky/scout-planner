import React, { useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useConfig } from "../store/configSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const apiKey = useConfig("apiKey");
  const authDomain = useConfig("authDomain");
  const projectId = useConfig("projectId");

  const app = useMemo(() => {
    return initializeApp({
      apiKey,
      authDomain,
      projectId,
    });
  }, [apiKey, authDomain, projectId]);

  const auth = useMemo(() => getAuth(app), [app]);
  const db = useMemo(() => getFirestore(app), [app]);
  const provider = useMemo(() => new GoogleAuthProvider(), []);

  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const login = async () => {
    setInitializing(true);
    await signInWithPopup(auth, provider);
  };
  const logout = async () => {
    setUser(null);
    await signOut(auth);
  };

  auth && auth.currentUser.getIdToken().then((a) => console.log(a));

  const authChanged = useCallback((firebaseUser) => {
    if (firebaseUser) setUser(firebaseUser);
    setInitializing(false);
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, authChanged);
  }, [authChanged]);

  return (
    <AuthContext.Provider value={{ user, login, logout, initializing, db }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const testing = {
  AuthContext,
};
