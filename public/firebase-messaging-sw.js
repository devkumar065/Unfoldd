importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// SETUP INSTRUCTIONS:
// 1. Replace all placeholder values with your actual Firebase config values
// 2. This file must be in /public folder
// 3. Register this SW in your app

firebase.initializeApp({
  apiKey: 'NEXT_PUBLIC_FIREBASE_API_KEY_VALUE',
  authDomain: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  messagingSenderId: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'NEXT_PUBLIC_FIREBASE_APP_ID'
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, data } = payload.notification || payload.data

  self.registration.showNotification(title, {
    body,
    icon: icon || '/logo.png',
    badge: '/logo.png',
    data: data || {},
    actions: [
      { action: 'open', title: 'Open Unfoldd' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return
  const url = event.notification.data?.url || '/dashboard'
  event.waitUntil(clients.openWindow(url))
})
