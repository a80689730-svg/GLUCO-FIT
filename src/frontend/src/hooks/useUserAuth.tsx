import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AppUser } from "../types";

// ─── User Auth Context ─────────────────────────────────────────────────────────

const USER_STORAGE_KEY = "glucofit_user";

interface UserAuthContextValue {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const UserAuthContext = createContext<UserAuthContextValue>({
  currentUser: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as AppUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = useCallback((email: string, name: string) => {
    setCurrentUser({ email, name });
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const value: UserAuthContextValue = {
    currentUser,
    isLoggedIn: currentUser !== null,
    login,
    logout,
  };

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserAuthContext);
}
