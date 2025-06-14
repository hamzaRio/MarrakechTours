import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  username: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ success: boolean; user: User; token?: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<{ success: boolean; tokenInvalidated?: boolean }, Error, void>;
  token: string | null;
  isTokenValid: boolean;
  tokenExpiresAt: Date | null;
};

type LoginData = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Constants for token storage
const TOKEN_STORAGE_KEY = 'marrakechdeserts_auth_token';
const TOKEN_EXPIRY_KEY = 'marrakechdeserts_token_expiry';

// Function to get stored token
function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Function to get token expiry
function getTokenExpiry(): Date | null {
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiryStr ? new Date(expiryStr) : null;
}

// Function to store token and expiry
function storeToken(token: string, expiresIn: string | number): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  
  // Calculate expiry date
  const expiryDate = new Date();
  if (typeof expiresIn === 'string') {
    // Handle formats like '24h', '7d', etc.
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    if (unit === 'h') {
      expiryDate.setHours(expiryDate.getHours() + value);
    } else if (unit === 'd') {
      expiryDate.setDate(expiryDate.getDate() + value);
    }
  } else {
    // Handle numeric seconds
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
  }
  
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
}

// Function to clear token
function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

// Function to check if token is valid (not expired)
function isTokenValid(): boolean {
  const expiry = getTokenExpiry();
  return !!expiry && expiry > new Date();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Get stored token and expiry
  const storedToken = getStoredToken();
  const tokenExpiresAt = getTokenExpiry();
  const tokenValid = isTokenValid();

  interface MeResponse {
    success: boolean;
    user?: User;
    tokenValid?: boolean;
    message?: string;
  }

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<MeResponse | null>({
    queryKey: ["/api/me"],
    queryFn: getQueryFn<MeResponse | null>({
      on401: "returnNull",
      extraHeaders: storedToken ? {
        Authorization: `Bearer ${storedToken}`
      } : undefined
    }),
  });

  // Default to null if userData is undefined or doesn't have success flag
  const user: User | null =
    userData && userData.success === true ? userData.user ?? null : null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        // Store JWT token if provided
        if (data.token) {
          storeToken(data.token, data.expiresIn || '24h');
        }
        
        queryClient.setQueryData(["/api/me"], data);
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.username}!`,
        });
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid username or password",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Add the JWT token to the logout request if available
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers.Authorization = `Bearer ${storedToken}`;
      }
      
      const res = await apiRequest("POST", "/api/logout", undefined, headers);
      return await res.json();
    },
    onSuccess: () => {
      // Clear the stored token
      clearToken();
      
      queryClient.setQueryData(["/api/me"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        token: storedToken,
        isTokenValid: tokenValid,
        tokenExpiresAt: tokenExpiresAt,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}