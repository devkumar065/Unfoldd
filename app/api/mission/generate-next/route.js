import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { groqComplete, GROQ_MODELS } from '@/lib/groq/client'
import { 
  SYSTEM_PROMPTS,
  buildUserContext,
  getRoleSkillProgression,
  getExamPressure
} from '@/lib/groq/prompts'
import { getGroqConfig } from '@/lib/config/getConfig'

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return NextResponse.json(
    { error: 'Unauthorized' }, { status: 401 })

  // ── FETCH CONFIG ──────────────────────────
  const { apiKey, models } = await getGroqConfig()

  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
  }

  // ── FETCH ALL USER CONTEXT ────────────────

  const [
    { data: profile },
    { data: roadmap },
    { data: learnedSkills },
    { data: completedMissions }
  ] = await Promise.all([
    supabase.from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase.from('roadmaps')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single(),
    supabase.from('skills')
      .select('skill_name, is_verified')
      .eq('user_id', user.id)
      .eq('is_learned', true),
    supabase.from('daily_missions')
      .select('topic_title, day_number, test_score')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('day_number', { ascending: false })
      .limit(5)
  ])

  if (!profile || !roadmap) {
    return NextResponse.json(
      { error: 'Profile or roadmap not found' },
      { status: 404 })
  }

  const nextDay = (roadmap.current_day || 0) + 1
  
  if (nextDay > 90) {
    return NextResponse.json(
      { error: 'Journey complete! 90 days done.' },
      { status: 400 })
  }

  // ── CHECK VIDEO LIBRARY FIRST ─────────────
  const { data: availableVideos } = await supabase
    .from('topic_videos')
    .select('id, topic_title, youtube_video_id, duration_seconds, difficulty')
    .eq('role', profile.target_role)
    .eq('day_number', nextDay)
    .eq('is_active', true)
    .limit(1)

  const hasVideo = availableVideos?.length > 0
  const videoForDay = hasVideo ? availableVideos[0] : null

  // ── BUILD COMPLETE CONTEXT FOR AI ─────────

  const userContext = buildUserContext({
    ...profile,
    current_day: nextDay,
    learned_skills: learnedSkills?.map(
      s => s.skill_name) || [],
    verified_skills: learnedSkills
      ?.filter(s => s.is_verified)
      .map(s => s.skill_name) || []
  })

  const currentPhase = getRoleSkillProgression(
    profile.target_role, nextDay)
  
  const examPressure = getExamPressure(
    profile.exam_dates)

  const recentTopics = completedMissions
    ?.map(m => m.topic_title)
    .filter(Boolean)
    .join(', ') || 'none yet'

  const topicInstruction = videoForDay
    ? `The topic for today MUST be: "${videoForDay.topic_title}" (we have a video for this topic in our library)`
    : `Choose the most appropriate topic for Day ${nextDay} based on the progression`

  // ── BUILD THE MISSION PROMPT ──────────────

  const missionPrompt = `
${userContext}

CURRENT LEARNING PHASE:
Focus Area: ${currentPhase.focus}
Phase Days: ${currentPhase.days}

RECENT COMPLETED TOPICS: ${recentTopics}

${examPressure ? `
⚠️ EXAM ALERT: Student has ${examPressure.subject} exam in ${examPressure.daysUntil} days!
${examPressure.isUrgent 
  ? 'Make today a LIGHT revision day — reduce build task complexity.'
  : 'Keep mission moderate — exam is coming up.'}
` : ''}

VIDEO LIBRARY STATUS: ${
  hasVideo 
    ? `✅ We have a video for today's topic`
    : '❌ No video in library yet — student will learn from resources'
}

TASK: Generate Day ${nextDay} mission for this student.

${topicInstruction}

REQUIREMENTS:
1. Topic must naturally follow from: ${recentTopics}
2. Must be achievable in ${profile.daily_time_minutes} minutes
3. Build task must produce something real and testable
4. Apply task must be a REAL company students can actually apply to (Indian startups preferred)
5. Resources must be real, specific URLs

Return this EXACT JSON structure (no other text):
{
  "day": ${nextDay},
  "topic": "Specific topic name",
  "topic_description": "2 sentence description of what this topic is and why it matters for ${profile.target_role}",
  "skill_name": "Exact skill name to add to portfolio",
  "difficulty": "beginner|intermediate|advanced",
  "learn_task": {
    "title": "Specific learn task title",
    "description": "Detailed 2-3 sentence description of exactly what to learn today. Be specific — name the exact concepts, functions, or techniques.",
    "what_to_focus_on": ["specific concept 1", "specific concept 2", "specific concept 3"],
    "resources": [
      {
        "title": "Resource name",
        "url": "https://actual-url.com",
        "type": "article|video|documentation|tutorial"
      }
    ],
    "estimated_minutes": ${Math.round(profile.daily_time_minutes * 0.4)}
  },
  "build_task": {
    "title": "Build task title",
    "description": "Exactly what to build — be very specific about features and expected behavior",
    "steps": ["step 1", "step 2", "step 3"],
    "expected_output": "What the finished project/code should do",
    "github_hint": "What to name the repo/file",
    "estimated_minutes": ${Math.round(profile.daily_time_minutes * 0.45)}
  },
  "apply_task": {
    "title": "Apply to [Company] for [Role]",
    "company": "Real company name",
    "role": "Specific role title",
    "link": "https://real-application-link.com",
    "why_match": "Why this matches the student's current skill level",
    "estimated_minutes": ${Math.round(profile.daily_time_minutes * 0.15)}
  },
  "motivation": "One powerful sentence to motivate the student to complete this mission today"
}`

  // ── CALL GROQ API ─────────────────────────

  let missionData
  try {
    missionData = await groqComplete({
      prompt: missionPrompt,
      model: models.smart,
      maxTokens: 1500,
      temperature: 0.6,
      systemPrompt: SYSTEM_PROMPTS.MISSION_GENERATOR
    })
  } catch(error) {
    console.error('Groq mission generation failed:', error)
    // Use intelligent fallback
    missionData = generateFallbackMission(nextDay, profile, currentPhase, videoForDay)
  }

  // ── SAVE MISSION TO DATABASE ──────────────

  const { data: newMission, error: missionError } = 
    await supabase.from('daily_missions').insert({
      user_id: user.id,
      roadmap_id: roadmap.id,
      day_number: nextDay,
      topic_title: missionData.topic,
      learn_task: {
        title: missionData.learn_task.title,
        description: missionData.learn_task.description,
        what_to_focus_on: missionData.learn_task.what_to_focus_on || [],
        resources: missionData.learn_task.resources || [],
        estimated_minutes: missionData.learn_task.estimated_minutes
      },
      build_task: {
        title: missionData.build_task.title,
        description: missionData.build_task.description,
        steps: missionData.build_task.steps || [],
        expected_output: missionData.build_task.expected_output,
        github_hint: missionData.build_task.github_hint,
        estimated_minutes: missionData.build_task.estimated_minutes
      },
      apply_task: {
        title: missionData.apply_task.title,
        company: missionData.apply_task.company,
        role: missionData.apply_task.role,
        link: missionData.apply_task.link,
        why_match: missionData.apply_task.why_match,
        estimated_minutes: missionData.apply_task.estimated_minutes
      },
      // Link video if available in library
      video_id: videoForDay?.id || null,
      status: 'pending'
    })
    .select()
    .single()

  if (missionError) {
    console.error('Mission save error:', missionError)
    return NextResponse.json(
      { error: 'Failed to save mission' },
      { status: 500 })
  }

  // ── UPDATE ROADMAP CURRENT DAY ────────────
  await supabase.from('roadmaps')
    .update({ current_day: nextDay })
    .eq('id', roadmap.id)

  // ── SEND NOTIFICATION ─────────────────────
  await supabase.from('notifications').insert({
    user_id: user.id,
    title: `Day ${nextDay} Mission Ready! 🎯`,
    body: `Today: ${missionData.topic}. ${missionData.motivation}`,
    type: 'mission',
    action_url: `/missions/${nextDay}`
  })

  // ── TRACK ANALYTICS ───────────────────────
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_type: 'mission_generated',
    event_data: {
      day: nextDay,
      topic: missionData.topic,
      had_video: hasVideo,
      model_used: models.smart
    }
  })

  return NextResponse.json({
    success: true,
    mission: newMission,
    hasVideo,
    video: videoForDay,
    dayNumber: nextDay
  })
}

// ── FALLBACK MISSION GENERATOR ────────────────
function generateFallbackMission(day, profile, phase, video) {
  const topics = {
    fullstack: [
      'HTML Document Structure', 'CSS Selectors and Specificity', 'JavaScript Variables and Data Types',
      'JavaScript Functions and Scope', 'DOM Manipulation Basics', 'Event Listeners and Handlers',
      'Fetch API and Promises', 'Async/Await Pattern', 'React Components Basics', 'React useState Hook'
    ],
    sde: [
      'Arrays and Time Complexity', 'String Manipulation', 'Linked List Basics', 'Stack and Queue',
      'Binary Search', 'Recursion Fundamentals', 'Hash Maps and Sets', 'Tree Traversal',
      'Graph BFS/DFS', 'Dynamic Programming Intro'
    ],
    cybersecurity: [
      'OSI Model and TCP/IP', 'Linux Command Line Basics', 'Network Scanning with Nmap',
      'HTTP and HTTPS Protocol', 'SQL Injection Basics', 'Cross-Site Scripting (XSS)',
      'Burp Suite Introduction', 'Password Cracking Concepts', 'Wireshark Packet Analysis', 'OWASP Top 10'
    ]
  }

  const roleTopics = topics[profile.target_role] || topics.fullstack
  const topicIndex = (day - 1) % roleTopics.length
  const topic = video?.topic_title || roleTopics[topicIndex]

  return {
    day,
    topic,
    topic_description: `Learn ${topic} as part of your ${profile.target_role} journey. This is a core skill you will use daily in your career.`,
    skill_name: topic,
    difficulty: day <= 30 ? 'beginner' : day <= 60 ? 'intermediate' : 'advanced',
    learn_task: {
      title: `Study ${topic}`,
      description: `Focus on understanding the core concepts of ${topic}. Read documentation and watch tutorials to build a solid foundation.`,
      what_to_focus_on: [`Core concepts of ${topic}`, 'Practical applications', 'Common patterns and best practices'],
      resources: [
        { title: `${topic} - MDN Web Docs`, url: 'https://developer.mozilla.org', type: 'documentation' },
        { title: `${topic} Tutorial`, url: 'https://www.youtube.com', type: 'video' }
      ],
      estimated_minutes: Math.round(profile.daily_time_minutes * 0.4)
    },
    build_task: {
      title: `Build a ${topic} project`,
      description: `Create a small project demonstrating your understanding of ${topic}. Focus on making it functional and clean.`,
      steps: ['Set up your project structure', `Implement core ${topic} features`, 'Test your implementation', 'Push to GitHub'],
      expected_output: `A working implementation demonstrating ${topic}`,
      github_hint: `${topic.toLowerCase().replace(/ /g,'-')}-practice`,
      estimated_minutes: Math.round(profile.daily_time_minutes * 0.45)
    },
    apply_task: {
      title: 'Apply to Internshala',
      company: 'Various Startups',
      role: profile.target_role,
      link: 'https://internshala.com',
      why_match: 'Build your application history',
      estimated_minutes: Math.round(profile.daily_time_minutes * 0.15)
    },
    motivation: `Every expert was once a beginner. Day ${day} is bringing you closer to your goal!`
  }
}