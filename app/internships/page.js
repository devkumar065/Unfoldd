import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { InternshipsClient } from '@/components/internships/InternshipsClient'

export const dynamic = 'force-dynamic'

function calculateMatch(internship, studentSkills) {
  const required = internship.required_skills || []
  if (required.length === 0) return 50

  const studentSkillNames = (studentSkills || []).map(s => s.skill_name.toLowerCase())
  const verifiedNames = (studentSkills || [])
    .filter(s => s.is_verified)
    .map(s => s.skill_name.toLowerCase())

  let matchCount = 0
  let verifiedMatch = 0

  required.forEach(req => {
    const reqLower = req.toLowerCase()
    if (studentSkillNames.some(s => s.includes(reqLower) || reqLower.includes(s)))
      matchCount++
    if (verifiedNames.some(s => s.includes(reqLower)))
      verifiedMatch++
  })

  const base = (matchCount / required.length) * 70
  const bonus = (verifiedMatch / required.length) * 30
  return Math.min(100, Math.round(base + bonus))
}

export default async function InternshipsPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  const userId = session.user.id

  const [
    { data: profile },
    { data: skills },
    { data: allInternships },
    { data: applications }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('skills').select('*').eq('user_id', userId),
    supabase.from('internships')
      .select('*')
      .eq('is_active', true)
      .gt('deadline', new Date().toISOString())
      .order('created_at', { ascending: false }),
    supabase.from('internship_applications')
      .select('*, internships(*)')
      .eq('user_id', userId)
  ])

  const internshipsWithMatch = (allInternships || []).map(internship => ({
    ...internship,
    match_percentage: calculateMatch(internship, skills || [])
  }))

  // Sort by match percentage DESC
  internshipsWithMatch.sort((a, b) => b.match_percentage - a.match_percentage)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <InternshipsClient 
        internships={internshipsWithMatch} 
        applications={applications || []} 
        profile={profile}
        skills={skills || []}
      />
    </div>
  )
}
