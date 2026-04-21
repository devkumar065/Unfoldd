import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

let settingsCache = null
let cacheTime = null
const CACHE_TTL = 5 * 60 * 1000

export async function getSetting(key) {
  await refreshCache()
  return settingsCache?.[key] || process.env[keyToEnvVar(key)]
}

export async function getAllSettings(category) {
  await refreshCache()
  if (!category) return settingsCache
  
  return Object.fromEntries(
    Object.entries(settingsCache || {}).filter(([k]) => k.startsWith(category))
  )
}

async function refreshCache() {
  const now = Date.now()
  if (settingsCache && cacheTime && now - cacheTime < CACHE_TTL) return

  try {
    const { data } = await supabase.from('platform_settings').select('key, value')
    settingsCache = {}
    data?.forEach(s => {
      settingsCache[s.key] = s.value
    })
    cacheTime = now
  } catch (e) {
    // If table doesn't exist yet, fall back to process.env silently
    settingsCache = {}
  }
}

function keyToEnvVar(key) {
  return key.toUpperCase().replace(/-/g, '_')
}

export async function getRazorpayKeys() {
  return {
    keyId: await getSetting('razorpay_key_id') || process.env.RAZORPAY_KEY_ID,
    keySecret: await getSetting('razorpay_key_secret') || process.env.RAZORPAY_KEY_SECRET
  }
}

export async function getSMTPConfig() {
  return {
    host: await getSetting('smtp_host') || process.env.SMTP_HOST,
    port: parseInt(await getSetting('smtp_port') || process.env.SMTP_PORT || '587'),
    user: await getSetting('smtp_user') || process.env.SMTP_USER,
    password: await getSetting('smtp_password') || process.env.SMTP_PASSWORD,
    fromName: await getSetting('smtp_from_name') || 'Unfoldd',
    fromEmail: await getSetting('smtp_from_email') || process.env.SMTP_FROM_EMAIL
  }
}

export async function getGroqKey() {
  return await getSetting('groq_api_key') || process.env.GROQ_API_KEY
}

export async function getGroqModel(type = 'smart') {
  const models = {
    smart: await getSetting('groq_model_smart') || 'llama-3.3-70b-versatile',
    fast: await getSetting('groq_model_fast') || 'llama-3.1-8b-instant',
    code: await getSetting('groq_model_code') || 'llama3-70b-8192'
  }
  return models[type] || models.smart
}
