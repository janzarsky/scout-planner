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
import config from "../config.json"

const AuthContext = createContext(null);

const app = initializeApp({
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
});
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export function AuthProvider({ children }) {
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
