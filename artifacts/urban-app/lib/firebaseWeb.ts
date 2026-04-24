import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  // @ts-ignore - this export exists at runtime even though types omit it.
  getReactNativePersistence,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ApplicationVerifier,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyBdqFqB0o-wWO-pL5w6yvpMVjV697BBmEo",
  authDomain: "ultrofix-e5ed6.firebaseapp.com",
  projectId: "ultrofix-e5ed6",
  storageBucket: "ultrofix-e5ed6.firebasestorage.app",
  messagingSenderId: "1015159560629",
  appId: "1:1015159560629:web:0000000000000000000000",
};

const HAS_DOM =
  typeof window !== "undefined" && typeof document !== "undefined";
const IS_BROWSER = Platform.OS === "web" && HAS_DOM;

let app: FirebaseApp | null = null;
let webAuth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getWebAuth(): Auth {
  if (!webAuth) {
    if (IS_BROWSER) {
      webAuth = getAuth(getFirebaseApp());
    } else {
      // React Native (Expo Go) — initialize auth with AsyncStorage persistence.
      try {
        webAuth = initializeAuth(getFirebaseApp(), {
          persistence: getReactNativePersistence(AsyncStorage),
        });
      } catch {
        // If already initialized (e.g. Fast Refresh), fall back to getAuth.
        webAuth = getAuth(getFirebaseApp());
      }
    }
    try {
      webAuth.useDeviceLanguage();
    } catch {
      // useDeviceLanguage is a no-op on RN
    }
    // In development, allow phone numbers added to Firebase Console under
    // Authentication → Sign-in method → Phone → "Phone numbers for testing"
    // to bypass real SMS and the reCAPTCHA challenge. The static OTP code
    // configured for that number in the console is what the user enters.
    // This setting has NO effect for phone numbers that aren't whitelisted
    // as test numbers, so it's safe to leave on in dev.
    if (process.env.NODE_ENV !== "production") {
      try {
        webAuth.settings.appVerificationDisabledForTesting = true;
      } catch {
        // ignore
      }
    }
  }
  return webAuth;
}

export const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha-container";

let recaptchaVerifier: RecaptchaVerifier | null = null;

function ensureBrowserRecaptcha(): RecaptchaVerifier {
  if (!HAS_DOM) {
    throw new Error("Browser environment is required for reCAPTCHA.");
  }

  let container = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = RECAPTCHA_CONTAINER_ID;
    container.style.position = "fixed";
    container.style.bottom = "16px";
    container.style.right = "16px";
    container.style.zIndex = "9999";
    document.body.appendChild(container);
  }

  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(getWebAuth(), container, {
      size: "invisible",
    });
  }
  return recaptchaVerifier;
}

// Fake verifier used in React Native (Expo Go) environments. Combined with
// `appVerificationDisabledForTesting = true`, Firebase will accept this for
// phone numbers that are explicitly whitelisted as test numbers in
// Firebase Console. Real phone numbers will be rejected.
const fakeVerifier: ApplicationVerifier = {
  type: "recaptcha",
  verify: async () => "fake-token-for-rn-testing",
};

function ensureVerifier(): ApplicationVerifier {
  return IS_BROWSER ? ensureBrowserRecaptcha() : fakeVerifier;
}

export async function webSendOtp(
  phoneNumberE164: string,
): Promise<ConfirmationResult> {
  const verifier = ensureVerifier();
  try {
    return await signInWithPhoneNumber(
      getWebAuth(),
      phoneNumberE164,
      verifier,
    );
  } catch (err: any) {
    // Surface the real Firebase failure mode in the console so it's debuggable.
    console.error("[firebaseWeb] signInWithPhoneNumber failed:", {
      code: err?.code,
      message: err?.message,
    });
    // If the verifier was consumed or expired, reset it for next attempt.
    try {
      recaptchaVerifier?.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
    // Translate the most common Firebase error codes into user-friendly messages.
    const code: string | undefined = err?.code;
    if (
      code === "auth/invalid-app-credential" ||
      code === "auth/captcha-check-failed"
    ) {
      throw new Error(
        IS_BROWSER
          ? "This domain isn't authorized in Firebase. Add the current preview domain under Firebase Console → Authentication → Settings → Authorized domains."
          : "This phone number isn't whitelisted as a test number. In Expo Go, add it under Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing.",
      );
    }
    if (code === "auth/invalid-phone-number") {
      throw new Error(
        "That phone number doesn't look right. Use the full international format, e.g. +919876543210.",
      );
    }
    if (code === "auth/too-many-requests") {
      throw new Error(
        "Too many OTP attempts from this device. Try again in a little while.",
      );
    }
    if (code === "auth/quota-exceeded") {
      throw new Error("Daily SMS quota exceeded for this Firebase project.");
    }
    if (code === "auth/billing-not-enabled") {
      throw new Error(
        "Phone Auth requires the Blaze (pay-as-you-go) plan in this Firebase project.",
      );
    }
    if (code === "auth/missing-app-credential") {
      throw new Error(
        "Phone Auth in Expo Go only works with whitelisted test phone numbers. Add yours under Firebase Console → Authentication → Sign-in method → Phone → Phone numbers for testing.",
      );
    }
    throw err instanceof Error ? err : new Error(String(err));
  }
}

export function resetWebRecaptcha() {
  try {
    recaptchaVerifier?.clear();
  } catch {
    // ignore
  }
  recaptchaVerifier = null;
}
