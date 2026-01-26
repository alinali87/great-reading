import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  User,
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  getMe,
  getToken,
  isAuthenticated as checkAuth,
} from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (checkAuth()) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch {
          // Token is invalid or expired
          logoutApi();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await loginApi(email, password);
    const userData = await getMe();
    setUser(userData);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    await signupApi(email, password);
    // After signup, automatically log in
    await loginApi(email, password);
    const userData = await getMe();
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
