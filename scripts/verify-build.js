const checks = [
  // Check all required env vars
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GROQ_API_KEY',
  'GROQ_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
]

console.log('🔍 Verifying build requirements...\n')

let allPassed = true

checks.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`❌ Missing: ${envVar}`)
    allPassed = false
  } else {
    console.log(`✅ ${envVar}: configured`)
  }
})

// Check critical files exist
const fs = require('fs')
const criticalFiles = [
  'app/page.js',
  'app/dashboard/page.js',
  'app/auth/login/page.js',
  'app/onboarding/page.js',
  'app/admin/page.js',
  'middleware.js',
]

console.log('\n🔍 Checking critical files...\n')

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ Missing: ${file}`)
    allPassed = false
  }
})

if (allPassed) {
  console.log('\n✅ All checks passed! Ready to deploy.')
} else {
  console.log('\n❌ Some checks failed. Fix before deploying.')
  process.exit(1)
}

