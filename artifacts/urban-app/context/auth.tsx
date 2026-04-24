import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";

const AUTH_TOKEN_KEY = "auth_session_token";
const IS_WEB = Platform.OS === "web";

type FirebaseAuthFn = () => FirebaseAuthTypes.Module;
let nativeAuth: FirebaseAuthFn | null = null;
if (!IS_WEB) {
  try {
    nativeAuth = require("@react-native-firebase/auth").default as FirebaseAuthFn;
  } catch (err) {
    console.warn("Firebase auth module not available:", err);
  }
}

export type UserRole = "consumer" | "provider" | null;

export interface AuthUser {
  id: string;
  phoneNumber: string | null;
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
  isOtpSending: boolean;
  isOtpVerifying: boolean;
  pendingPhoneNumber: string | null;
  sendOtp: (phoneNumberE164: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  cancelOtp: () => void;
  resendOtp: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: "consumer" | "provider") => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isOtpSending: false,
  isOtpVerifying: false,
  pendingPhoneNumber: null,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  cancelOtp: () => {},
  resendOtp: async () => {},
  logout: async () => {},
  setRole: async () => {},
  refreshUser: async () => {},
});

function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_DOMAIN) {
    return `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
  }
  return "";
}

setAuthTokenGetter(() => SecureStore.getItemAsync(AUTH_TOKEN_KEY));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState<string | null>(
    null,
  );
  const confirmationRef =
    useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const apiBase = getApiBaseUrl();
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const res = await fetch(`${apiBase}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.user) {
        setUser({
          id: data.user.id,
          phoneNumber: data.user.phoneNumber ?? null,
          email: data.user.email ?? null,
          firstName: data.user.firstName ?? null,
          lastName: data.user.lastName ?? null,
          profileImageUrl: data.user.profileImageUrl ?? null,
          role: (data.user.role as UserRole) ?? null,
        });
      } else {
        await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const exchangeFirebaseToken = useCallback(
    async (idToken: string) => {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/api/auth/firebase-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Server rejected verification");
      }
      const data = await res.json();
      if (!data?.token) throw new Error("Server did not return a session token");
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, data.token);
      setIsLoading(true);
      await fetchUser();
    },
    [fetchUser],
  );

  const sendOtp = useCallback(async (phoneNumberE164: string) => {
    if (IS_WEB || !nativeAuth) {
      throw new Error(
        "Phone sign-in requires the mobile app. Please use the iOS or Android build.",
      );
    }
    setIsOtpSending(true);
    try {
      const confirmation = await nativeAuth().signInWithPhoneNumber(
        phoneNumberE164,
        true,
      );
      confirmationRef.current = confirmation;
      setPendingPhoneNumber(phoneNumberE164);
    } finally {
      setIsOtpSending(false);
    }
  }, []);

  const resendOtp = useCallback(async () => {
    if (!pendingPhoneNumber || !nativeAuth) return;
    setIsOtpSending(true);
    try {
      const confirmation = await nativeAuth().signInWithPhoneNumber(
        pendingPhoneNumber,
        true,
      );
      confirmationRef.current = confirmation;
    } finally {
      setIsOtpSending(false);
    }
  }, [pendingPhoneNumber]);

  const verifyOtp = useCallback(
    async (code: string) => {
      const confirmation = confirmationRef.current;
      if (!confirmation) {
        throw new Error("No OTP request in progress. Please request a new code.");
      }
      setIsOtpVerifying(true);
      try {
        const credential = await confirmation.confirm(code);
        const fbUser = credential?.user ?? nativeAuth?.().currentUser;
        if (!fbUser) throw new Error("Verification did not return a user");
        const idToken = await fbUser.getIdToken(true);
        await exchangeFirebaseToken(idToken);
        confirmationRef.current = null;
        setPendingPhoneNumber(null);
      } finally {
        setIsOtpVerifying(false);
      }
    },
    [exchangeFirebaseToken],
  );

  const cancelOtp = useCallback(() => {
    confirmationRef.current = null;
    setPendingPhoneNumber(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      const apiBase = getApiBaseUrl();
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token) {
        await fetch(`${apiBase}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // ignore network errors
    } finally {
      try {
        if (nativeAuth?.().currentUser) await nativeAuth?.().signOut();
      } catch {
        // ignore
      }
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      confirmationRef.current = null;
      setPendingPhoneNumber(null);
      setUser(null);
    }
  }, []);

  const setRole = useCallback(async (role: "consumer" | "provider") => {
    try {
      const apiBase = getApiBaseUrl();
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (!token) return;
      const res = await fetch(`${apiBase}/api/auth/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });
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
        isOtpSending,
        isOtpVerifying,
        pendingPhoneNumber,
        sendOtp,
        verifyOtp,
        cancelOtp,
        resendOtp,
        logout,
        setRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
