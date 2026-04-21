export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { resumeData, targetRole } = await request.json()

  let score = 0
  const breakdown = {}

  const roleKeywords = getRoleKeywords(targetRole)
  const resumeText = JSON.stringify(resumeData).toLowerCase()
  const matchedKeywords = roleKeywords.filter(kw => resumeText.includes(kw.toLowerCase()))
  const keywordScore = Math.round((matchedKeywords.length / roleKeywords.length) * 40)
  score += keywordScore
  breakdown.keywords = { 
    score: keywordScore, 
    max: 40, 
    matched: matchedKeywords, 
    missing: roleKeywords.filter(kw => !matchedKeywords.includes(kw)) 
  }

  const verifiedCount = (resumeData.skills?.verified?.length) || 0
  const verifiedScore = Math.min(30, verifiedCount * 6)
  score += verifiedScore
  breakdown.verified = { score: verifiedScore, max: 30, count: verifiedCount }

  let sectionScore = 0
  if (resumeData.personal?.phone) sectionScore += 4
  if (resumeData.summary?.length > 50) sectionScore += 4
  if (resumeData.projects?.length > 0) sectionScore += 4
  if (resumeData.education?.institution) sectionScore += 4
  if (resumeData.personal?.linkedin) sectionScore += 4
  score += sectionScore
  breakdown.sections = { score: sectionScore, max: 20 }

  let formatScore = 0
  if (resumeData.personal?.name) formatScore += 2
  if (resumeData.personal?.email) formatScore += 2
  if (resumeData.projects?.length >= 2) formatScore += 3
  if (verifiedCount >= 3) formatScore += 3
  score += formatScore
  breakdown.formatting = { score: formatScore, max: 10 }

  await supabase.from('resumes').update({ 
    ats_score: score, 
    ats_breakdown: breakdown 
  }).eq('user_id', user.id)

  return NextResponse.json({ score, breakdown })
}

function getRoleKeywords(role) {
  const keywords = {
    fullstack: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'REST API', 'Git', 'HTML', 'CSS', 'TypeScript', 'Next.js'],
    sde: ['Data Structures', 'Algorithms', 'Problem Solving', 'OOP', 'Java', 'Python', 'C++', 'Git', 'System Design', 'SQL'],
    cybersecurity: ['Network Security', 'Linux', 'Penetration Testing', 'SIEM', 'Firewall', 'Python', 'Wireshark', 'TCP/IP', 'SOC'],
    data_science: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'TensorFlow', 'SQL', 'Data Analysis', 'Visualization', 'Statistics'],
    devops: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux', 'Terraform', 'Jenkins', 'Git', 'Monitoring', 'Shell Scripting'],
    uiux: ['Figma', 'User Research', 'Prototyping', 'Wireframing', 'Adobe XD', 'CSS', 'HTML', 'Usability Testing', 'Design Systems']
  }
  return keywords[role] || keywords.fullstack
}
