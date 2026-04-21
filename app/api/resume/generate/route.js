export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resumeData, template } = await request.json()
  const html = generateResumeHTML(resumeData, template)

  try {
    const puppeteer = require('puppeteer')
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
    })
    await browser.close()

    // FIXED: Use user.id folder for RLS
    const fileName = `${user.id}/${Date.now()}.pdf`
    
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, pdf, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName)

    await supabase.from('resumes').update({ pdf_url: publicUrl }).eq('user_id', user.id)

    return new Response(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(resumeData.personal?.name || 'Student').replace(/\s+/g, '-')}-resume.pdf"`
      }
    })

  } catch(error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
  }
}

function generateResumeHTML(data, template) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Arial', sans-serif; font-size: 11px; color: #333; line-height: 1.5; } h1 { font-size: 24px; color: #6C63FF; } h2 { font-size: 13px; color: #6C63FF; border-bottom: 1px solid #6C63FF; padding-bottom: 2px; margin: 14px 0 8px; text-transform: uppercase; letter-spacing: 0.5px; } .header { margin-bottom: 16px; } .contact { color: #555; font-size: 10px; margin-top: 4px; } .skills-grid { display: flex; flex-wrap: wrap; gap: 6px; } .skill-tag { background: #F0EEFF; color: #6C63FF; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: bold; } .skill-tag.verified::after { content: ' ✓'; color: #00A86B; } .project { margin-bottom: 10px; } .project-title { font-weight: bold; font-size: 12px; } .tech-stack { color: #666; font-size: 9px; margin-top: 2px; } .section { margin-bottom: 12px; } .summary { color: #444; } .watermark { position: fixed; bottom: 10px; right: 15px; color: #DDD; font-size: 8px; }</style></head><body><div class="header"><h1>${data.personal?.name}</h1><div class="contact">${data.personal?.email} ${data.personal?.phone ? '| ' + data.personal?.phone : ''} ${data.personal?.location ? '| ' + data.personal?.location : ''}</div><div class="contact">${data.personal?.linkedin ? data.personal?.linkedin : ''} ${data.personal?.github ? '| ' + data.personal?.github : ''}</div></div>${data.summary ? `<div class="section"><h2>Professional Summary</h2><p class="summary">${data.summary}</p></div>` : ''}<div class="section"><h2>Technical Skills</h2><div class="skills-grid">${data.skills?.verified?.map(s => `<span class="skill-tag verified">${s}</span>`).join('')}${data.skills?.other?.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>${data.projects?.length > 0 ? `<div class="section"><h2>Projects</h2>${data.projects.map(p => `<div class="project"><div class="project-title">${p.title} ${p.live_link ? ` | ${p.live_link}` : ''} ${p.github_link ? ` | ${p.github_link}` : ''}</div><div class="tech-stack">${Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : ''}</div><div>${p.description}</div></div>`).join('')}</div>` : ''}<div class="section"><h2>Education</h2><strong>${data.education?.institution}</strong><br>${data.education?.degree} in ${data.education?.branch} | ${data.education?.year} Year Student | Expected ${data.education?.graduation_year}</div><div class="watermark">Verified by Unfoldd</div></body></html>`
}
