import { getFirebaseMessaging } from '@/lib/firebase/admin'

// Send push to single device
export async function sendPushNotification({
  token,
  title,
  body,
  data = {},
  imageUrl = null
}) {
  if (!token) {
    console.log('No FCM token provided')
    return { success: false, reason: 'no_token' }
  }

  const messaging = getFirebaseMessaging()
  
  if (!messaging) {
    console.warn('Firebase messaging not available')
    return { 
      success: false, 
      reason: 'firebase_not_initialized' 
    }
  }

  try {
    const message = {
      token,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl })
      },
      data: {
        // Data must be string values
        ...Object.fromEntries(
          Object.entries(data).map(
            ([k, v]) => [k, String(v)])
        ),
        click_action: 'FLUTTER_NOTIFICATION_CLICK'
      },
      android: {
        notification: {
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          priority: 'high',
          sound: 'default'
        },
        priority: 'high'
      },
      webpush: {
        notification: {
          title,
          body,
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          requireInteraction: false
        },
        fcmOptions: {
          link: data.url || '/dashboard'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    }

    const response = await messaging.send(message)
    console.log('Push sent:', response)
    return { success: true, messageId: response }

  } catch(error) {
    console.error('Push notification error:', error)

    // Handle invalid token
    if (error.code === 'messaging/registration-token-not-registered' || error.code === 'messaging/invalid-registration-token') {
      return { 
        success: false, 
        reason: 'invalid_token',
        shouldRemove: true  // Signal to remove token from DB
      }
    }

    return { 
      success: false, 
      reason: error.message 
    }
  }
}

// Send push to multiple devices
export async function sendPushToMultiple({
  tokens,
  title,
  body,
  data = {}
}) {
  if (!tokens?.length) {
    return { success: false, reason: 'no_tokens' }
  }

  const messaging = getFirebaseMessaging()
  if (!messaging) {
    return { 
      success: false, 
      reason: 'firebase_not_initialized' 
    }
  }

  // Remove duplicate tokens
  const uniqueTokens = [...new Set(tokens)].filter(Boolean)

  if (uniqueTokens.length === 0) {
    return { success: false, reason: 'no_valid_tokens' }
  }

  try {
    // Firebase Admin supports sendEachForMulticast
    // Max 500 tokens per request
    const chunks = chunkArray(uniqueTokens, 500)
    
    let successCount = 0
    let failureCount = 0
    const invalidTokens = []

    for (const chunk of chunks) {
      const multicastMessage = {
        tokens: chunk,
        notification: { title, body },
        data: Object.fromEntries(
          Object.entries(data).map(
            ([k, v]) => [k, String(v)])
        ),
        webpush: {
          notification: {
            title,
            body,
            icon: '/icon-192.png'
          },
          fcmOptions: {
            link: data.url || '/dashboard'
          }
        }
      }

      const response = await messaging.sendEachForMulticast(multicastMessage)

      successCount += response.successCount
      failureCount += response.failureCount

      // Collect invalid tokens to remove
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code
          if (
            errorCode === 'messaging/registration-token-not-registered' ||
            errorCode === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(chunk[idx])
          }
        }
      })
    }

    // Clean up invalid tokens from DB
    if (invalidTokens.length > 0) {
      await cleanupInvalidTokens(invalidTokens)
    }

    return {
      success: true,
      successCount,
      failureCount,
      invalidTokensRemoved: invalidTokens.length
    }

  } catch(error) {
    console.error('Multicast push error:', error)
    return { success: false, reason: error.message }
  }
}

// Remove invalid tokens from database
async function cleanupInvalidTokens(tokens) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('profiles')
      .update({ notification_token: null })
      .in('notification_token', tokens)

    console.log(`Cleaned up ${tokens.length} invalid FCM tokens`)
  } catch(e) {
    console.error('Token cleanup error:', e)
  }
}

function chunkArray(array, size) {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// Test FCM connection
export async function testFCMConnection() {
  const messaging = getFirebaseMessaging()
  if (!messaging) {
    return { 
      connected: false, 
      error: 'Firebase Admin not initialized. Check service account file.' 
    }
  }
  return { connected: true }
}
