import { getSetting } from '@/lib/admin/settings'

// Groq config
export async function getGroqConfig() {
  const [apiKey, smartModel, fastModel] = await Promise.all([
    getSetting('groq_api_key'),
    getSetting('groq_model_smart'),
    getSetting('groq_model_fast')
  ])

  return {
    apiKey: apiKey || process.env.GROQ_API_KEY,
    models: {
      smart: smartModel || 'llama-3.3-70b-versatile',
      fast: fastModel || 'llama-3.1-8b-instant'
    }
  }
}

// Razorpay config
export async function getRazorpayConfig() {
  const [keyId, keySecret, webhookSecret, proPrice, premiumPrice] = await Promise.all([
    getSetting('razorpay_key_id'),
    getSetting('razorpay_key_secret'),
    getSetting('razorpay_webhook_secret'),
    getSetting('pro_price_inr'),
    getSetting('premium_price_inr')
  ])

  return {
    keyId: keyId || process.env.RAZORPAY_KEY_ID,
    keySecret: keySecret || process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET,
    proPrice: parseInt(proPrice || '199'),
    premiumPrice: parseInt(premiumPrice || '499')
  }
}

// SMTP config
export async function getSMTPConfig() {
  const [host, port, user, password, fromName, fromEmail] = await Promise.all([
    getSetting('smtp_host'),
    getSetting('smtp_port'),
    getSetting('smtp_user'),
    getSetting('smtp_password'),
    getSetting('smtp_from_name'),
    getSetting('smtp_from_email')
  ])

  return {
    host: host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(port || process.env.SMTP_PORT || '587'),
    user: user || process.env.SMTP_USER,
    password: password || process.env.SMTP_PASSWORD,
    fromName: fromName || 'Unfoldd',
    fromEmail: fromEmail || process.env.SMTP_FROM_EMAIL
  }
}

// Platform limits
export async function getPlatformLimits() {
  const [maxExamAttempts, examExpiryHours, freeVerifications, freeMatches] = await Promise.all([
    getSetting('max_exam_attempts'),
    getSetting('exam_expiry_hours'),
    getSetting('free_verifications_per_month'),
    getSetting('free_matches_per_week')
  ])

  return {
    maxExamAttempts: parseInt(maxExamAttempts || '3'),
    examExpiryHours: parseInt(examExpiryHours || '1'),
    freeVerificationsPerMonth: parseInt(freeVerifications || '3'),
    freeMatchesPerWeek: parseInt(freeMatches || '5')
  }
}
