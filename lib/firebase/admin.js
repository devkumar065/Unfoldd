import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { join } from 'path'

// Singleton pattern — initialize only once
let adminApp = null

function getFirebaseAdmin() {
  if (adminApp) return adminApp

  try {
    // Check if already initialized
    adminApp = admin.app()
    return adminApp
  } catch(e) {
    // Not initialized yet — initialize now
  }

  try {
    // Try loading from service account file
    const serviceAccountPath = join(
      process.cwd(),
      'service-account',
      'firebase-service-account.json'
    )

    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8')
    )

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    })

    console.log('✅ Firebase Admin initialized with service account')
    return adminApp

  } catch(fileError) {
    // File not found — try environment variable
    console.log('Service account file not found, trying env vars...')

    try {
      // Try from environment variable
      // (useful for Vercel deployment)
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON

      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson)

        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        })

        console.log('✅ Firebase Admin initialized from env variable')
        return adminApp
      }
    } catch(envError) {
      console.error('Firebase Admin init failed:', envError)
    }

    // Return null if initialization fails
    // Push notifications will be disabled
    console.warn('⚠️ Firebase Admin not initialized. Push notifications disabled.')
    return null
  }
}

export { getFirebaseAdmin }

// Get FCM messaging instance
export function getFirebaseMessaging() {
  const app = getFirebaseAdmin()
  if (!app) return null
  return admin.messaging(app)
}
