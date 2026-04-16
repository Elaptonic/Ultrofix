import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { setAuthTokenGetter } from "@workspace/api-client-react";

WebBrowser.maybeCompleteAuthSession();

const AUTH_TOKEN_KEY = "auth_session_token";
const ISSUER_URL = "https://replit.com/oidc";
const IS_WEB = Platform.OS === "web";

export type UserRole = "consumer" | "provider" | null;

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: "consumer" | "provider") => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  setRole: async () => {},
});

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

function getClientId(): string {
  return process.env.EXPO_PUBLIC_REPL_ID || "";
}

setAuthTokenGetter(() =>
  IS_WEB ? Promise.resolve(null) : SecureStore.getItemAsync(AUTH_TOKEN_KEY),
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const discovery = AuthSession.useAutoDiscovery(ISSUER_URL);
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: getClientId(),
      scopes: ["openid", "email", "profile", "offline_access"],
      redirectUri,
      prompt: AuthSession.Prompt.Login,
    },
    discovery,
  );

  const fetchUser = useCallback(async () => {
    try {
      const apiBase = getApiBaseUrl();

      let fetchOptions: RequestInit;
      if (IS_WEB) {
        fetchOptions = { credentials: "include" };
      } else {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        fetchOptions = { headers: { Authorization: `Bearer ${token}` } };
      }

      const res = await fetch(`${apiBase}/api/auth/user`, fetchOptions);
      const data = await res.json();

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email ?? null,
          firstName: data.user.firstName ?? null,
          lastName: data.user.lastName ?? null,
          profileImageUrl: data.user.profileImageUrl ?? null,
          role: (data.user.role as UserRole) ?? null,
        });
      } else {
        if (!IS_WEB) await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (IS_WEB) return;
    if (response?.type !== "success" || !request?.codeVerifier) return;

    const { code, state } = response.params;

    (async () => {
      try {
        const apiBase = getApiBaseUrl();
        if (!apiBase) return;

        const exchangeRes = await fetch(
          `${apiBase}/api/mobile-auth/token-exchange`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              code_verifier: request.codeVerifier,
              redirect_uri: redirectUri,
              state,
              nonce: request.nonce,
            }),
          },
        );

        if (!exchangeRes.ok) {
          setIsLoading(false);
          return;
        }

        const data = await exchangeRes.json();
        if (data.token) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
          setIsLoading(true);
          await fetchUser();
        }
      } catch {
        setIsLoading(false);
      }
    })();
  }, [response, request, redirectUri, fetchUser]);

  const login = useCallback(async () => {
    if (IS_WEB) {
      const apiBase = getApiBaseUrl();
      const returnTo = typeof window !== "undefined" ? window.location.href : "/";
      window.location.href = `${apiBase}/api/login?returnTo=${encodeURIComponent(returnTo)}`;
      return;
    }
    try {
      await promptAsync();
    } catch (err) {
      console.error("Login error:", err);
    }
  }, [promptAsync]);

  const logout = useCallback(async () => {
    try {
      const apiBase = getApiBaseUrl();
      if (IS_WEB) {
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: "POST",
          credentials: "include",
        });
        setUser(null);
        return;
      }
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        await fetch(`${apiBase}/api/mobile-auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
    } finally {
      if (!IS_WEB) await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      setUser(null);
    }
  }, []);

  const setRole = useCallback(async (role: "consumer" | "provider") => {
    try {
      const apiBase = getApiBaseUrl();
      let fetchOptions: RequestInit;

      if (IS_WEB) {
        fetchOptions = {
          credentials: "include",
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        };
      } else {
        const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        if (!token) return;
        fetchOptions = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        };
      }

      const res = await fetch(`${apiBase}/api/auth/role`, fetchOptions);
      if (!res.ok) return;

      const data = await res.json();
      if (data.user) {
        setUser((prev) => (prev ? { ...prev, role } : null));
      }
    } catch (err) {
      console.error("Set role error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
