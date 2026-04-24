import { Platform } from "react-native";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type Auth,
  type ConfirmationResult,
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDmAyQG3RLSEg5S0YrddOV1Q-AKcMUGP7k",
  authDomain: "ultrofix-e5ed6.firebaseapp.com",
  projectId: "ultrofix-e5ed6",
  storageBucket: "ultrofix-e5ed6.firebasestorage.app",
  messagingSenderId: "1015159560629",
  appId: "1:1015159560629:ios:335954c0ad3d604f07a1fc",
};

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
    webAuth = getAuth(getFirebaseApp());
    webAuth.useDeviceLanguage();
  }
  return webAuth;
}

export const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha-container";

let recaptchaVerifier: RecaptchaVerifier | null = null;

function ensureRecaptcha(): RecaptchaVerifier {
  if (Platform.OS !== "web") {
    throw new Error("reCAPTCHA is only available on web.");
  }
  if (typeof document === "undefined") {
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

export async function webSendOtp(
  phoneNumberE164: string,
): Promise<ConfirmationResult> {
  const verifier = ensureRecaptcha();
  try {
    return await signInWithPhoneNumber(
      getWebAuth(),
      phoneNumberE164,
      verifier,
    );
  } catch (err) {
    // If the verifier was consumed or expired, reset it for next attempt.
    try {
      recaptchaVerifier?.clear();
    } catch {
      // ignore
    }
    recaptchaVerifier = null;
    throw err;
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
