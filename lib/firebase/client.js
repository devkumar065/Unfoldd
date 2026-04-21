import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export { app }

export async function getFCMToken() {
  if (typeof window === 'undefined') return null
  try {
    const messaging = getMessaging(app)
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    })
    return token
  } catch (err) {
    // Fail silently in production or log to monitoring service
  }
}

export function onForegroundMessage(callback) {
  if (typeof window === 'undefined') return () => {}
  try {
    const messaging = getMessaging(app)
    return onMessage(messaging, callback)
  } catch(err) {
    return () => {}
  }
}
