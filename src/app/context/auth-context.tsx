"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { validateRequest } from "@/lib/auth-utils";
export interface User {
  userId: string;
  email: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  setAuthData: (data: AuthState) => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  setAuthData: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Sync auth state with server
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { user } = await validateRequest();
        if (user) {
          setAuthState({ isAuthenticated: true, user });
        } else {
          setAuthState({ isAuthenticated: false, user: null });
        }
      } catch (error) {
        console.error("Auth verification failed:", error);
        setAuthState({ isAuthenticated: false, user: null });
      } finally {
        setIsLoading(false); // Stop loading after verification
      }
    };
    verifyAuth();
  }, [pathname]); // Re-check on route change

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading,
        setAuthData: setAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
