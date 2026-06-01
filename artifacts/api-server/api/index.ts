/**
 * Vercel serverless entry point for the API server.
 *
 * NOTE: Socket.IO operates in HTTP long-polling mode on Vercel (no persistent
 * WebSocket upgrade is available in serverless functions). Real-time features
 * still work via polling — just with slightly higher latency than on a
 * long-running server.
 *
 * Required environment variables in your Vercel project:
 *   DATABASE_URL   – PostgreSQL connection string
 *   JWT_SECRET     – Secret used to sign session tokens
 *   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 *                  – Firebase Admin credentials for token verification
 *
 * Optional:
 *   RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET  – payment gateway
 *   EXPO_ACCESS_TOKEN                      – push notifications
 */
import app from "../src/app";

export default app;
