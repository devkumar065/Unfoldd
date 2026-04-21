export function welcomeEmailTemplate(name) {
  return `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; } .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; } .header { background: #6C63FF; padding: 40px; text-align: center; } .header h1 { color: white; margin: 0; font-size: 32px; } .body { padding: 40px; } .cta { display: block; background: #6C63FF; color: white; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 24px 0; } .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px; }</style></head><body><div class="container"><div class="header"><h1>Unfoldd 🚀</h1><p style="color: rgba(255,255,255,0.8)">Your career journey starts here</p></div><div class="body"><h2>Welcome, ${name}! 🎉</h2><p>You've just joined thousands of students unfolding their careers with Unfoldd.</p><p>Here's what happens next:</p><ul><li>✅ Complete your onboarding</li><li>🎯 Get your personalized 90-day roadmap</li><li>📚 Start learning with daily missions</li><li>✅ Verify your skills officially</li><li>💼 Get matched with internships</li></ul><a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding" class="cta">Start Unfolding →</a><p style="color: #666; font-size: 14px">Your 90-day transformation begins now. Show up every day and you will be interview-ready in 3 months.</p></div><div class="footer">© 2025 Unfoldd<br><a href="https://unfoldd.me/unsubscribe">Unsubscribe</a></div></div></body></html>`
}

export function streakLostTemplate(name, streak) {
  return `<h1>Your Unfoldd ${streak}-day streak ended 😢</h1><p>But you can start a new one today, ${name}!</p><a href="/dashboard">Start Fresh →</a>`
}

export function weeklyReportTemplate(name, missions, skills, streak) {
  return `<h1>Your Week in Review 📊</h1><p>${name}, here's what you accomplished:</p><ul><li>📚 ${missions} missions completed</li><li>🧠 ${skills} new skills learned</li><li>🔥 Current streak: ${streak} days</li></ul>`
}
