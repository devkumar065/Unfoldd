import nodemailer from 'nodemailer'
import { getSMTPConfig } from '@/lib/config/getConfig'

async function getTransporter() {
  const config = await getSMTPConfig()
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password
    }
  })
}

export async function sendEmail({ to, subject, html, text }) {
  try {
    const config = await getSMTPConfig()
    const transporter = await getTransporter()
    
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    })
    return { success: true }
  } catch(err) {
    console.error('Email send error:', err)
    return { success: false, error: err.message }
  }
}

export async function sendEmailToMany(recipients, { subject, html }) {
  const results = []
  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50)
    await Promise.all(batch.map(recipient =>
      sendEmail({
        to: recipient.email,
        subject,
        html: html.replace('{{name}}', recipient.name || 'Student')
      })
    ))
    results.push(...batch)
    if (i + 50 < recipients.length) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  return { success: true, sent: results.length }
}