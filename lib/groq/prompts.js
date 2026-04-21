// ── SYSTEM PROMPTS ────────────────────────────

export const SYSTEM_PROMPTS = {
  
  MISSION_GENERATOR: `You are an expert career coach 
and curriculum designer for engineering students in India.
You create highly practical, industry-relevant daily 
learning missions.

Your missions are:
- Specific and actionable (not generic)
- Based on real industry tools and practices  
- Progressive (each day builds on previous)
- Realistic for the student's available time
- Proven to help students get hired

You ALWAYS respond with valid JSON only.
No explanations. No markdown. Just JSON.`,

  QUESTION_GENERATOR: `You are an expert technical 
educator creating assessment questions for engineering 
students learning ${'{topic}'}.

Your questions are:
- Clear and unambiguous
- Testing actual understanding not memorization
- Progressively harder across difficulty levels
- Based on real interview and exam patterns
- Have exactly one correct answer

You ALWAYS respond with valid JSON only.
No explanations. No markdown. Just JSON.`,

  ROADMAP_PLANNER: `You are a senior tech industry 
expert who has interviewed 1000s of candidates and 
knows exactly what skills lead to getting hired.

You create learning roadmaps that are:
- Industry-proven (not theoretical)
- Role-specific (not generic)
- Achievable for busy students
- Building toward real job skills

You ALWAYS respond with valid JSON only.
No explanations. No markdown. Just JSON.`
}

// ── PROMPT BUILDERS ───────────────────────────

// Build context string from user data
export function buildUserContext(userData) {
  return `
STUDENT PROFILE:
- Name: ${userData.full_name}
- College: ${userData.college}
- Year: ${userData.year} year BTech
- Branch: ${userData.branch}
- Target Role: ${userData.target_role}
- Daily Available Time: ${userData.daily_time_minutes} minutes
- Current Day: Day ${userData.current_day} of their journey
- Skills Already Learned: ${
  userData.learned_skills?.join(', ') || 'None yet'
}
- Skills Verified: ${
  userData.verified_skills?.join(', ') || 'None yet'
}
- Current Streak: ${userData.streak_count} days
- Class Schedule: ${
  userData.class_timings?.length > 0 
    ? userData.class_timings.map(ct => 
        `${ct.day}: ${ct.slots?.join(', ')}`
      ).join(' | ')
    : 'Not specified'
}
- Upcoming Exams: ${
  userData.exam_dates?.length > 0
    ? userData.exam_dates.map(e => 
        `${e.subject} on ${e.date}`
      ).join(', ')
    : 'None upcoming'
}`
}

// Build role-specific skill progression
export function getRoleSkillProgression(role, day) {
  const progressions = {
    fullstack: {
      phase1: { days: '1-20', focus: 'HTML, CSS, JavaScript Fundamentals' },
      phase2: { days: '21-40', focus: 'React, Node.js, REST APIs' },
      phase3: { days: '41-60', focus: 'Databases, Authentication, Deployment' },
      phase4: { days: '61-80', focus: 'Advanced React, System Design, Projects' },
      phase5: { days: '81-90', focus: 'Interview Prep, Portfolio Polish, Applications' }
    },
    sde: {
      phase1: { days: '1-20', focus: 'Data Structures: Arrays, Strings, LinkedLists' },
      phase2: { days: '21-40', focus: 'Trees, Graphs, Dynamic Programming' },
      phase3: { days: '41-60', focus: 'System Design Basics, OOP, Design Patterns' },
      phase4: { days: '61-80', focus: 'Advanced Algorithms, Mock Interviews, Projects' },
      phase5: { days: '81-90', focus: 'Company-specific prep, Resume optimization' }
    },
    cybersecurity: {
      phase1: { days: '1-20', focus: 'Networking, Linux, TCP/IP, Protocols' },
      phase2: { days: '21-40', focus: 'Web Security, OWASP, Burp Suite basics' },
      phase3: { days: '41-60', focus: 'Penetration Testing, CTF challenges' },
      phase4: { days: '61-80', focus: 'SOC operations, SIEM, Incident Response' },
      phase5: { days: '81-90', focus: 'Certifications prep, Portfolio, Applications' }
    },
    data_science: {
      phase1: { days: '1-20', focus: 'Python, Pandas, NumPy, Data Cleaning' },
      phase2: { days: '21-40', focus: 'Statistics, Visualization, EDA' },
      phase3: { days: '41-60', focus: 'ML Algorithms, Scikit-learn, Model Evaluation' },
      phase4: { days: '61-80', focus: 'Deep Learning, TensorFlow, Real Projects' },
      phase5: { days: '81-90', focus: 'Kaggle competitions, Portfolio, Applications' }
    },
    devops: {
      phase1: { days: '1-20', focus: 'Linux, Shell Scripting, Git, Networking' },
      phase2: { days: '21-40', focus: 'Docker, Docker Compose, Containerization' },
      phase3: { days: '41-60', focus: 'Kubernetes, Cloud (AWS/GCP), CI/CD' },
      phase4: { days: '61-80', focus: 'Terraform, Monitoring, Security, Projects' },
      phase5: { days: '81-90', focus: 'Certifications, Portfolio, Applications' }
    },
    uiux: {
      phase1: { days: '1-20', focus: 'Design Principles, Figma Basics, Color Theory' },
      phase2: { days: '21-40', focus: 'User Research, Wireframing, Prototyping' },
      phase3: { days: '41-60', focus: 'Design Systems, Advanced Figma, Animations' },
      phase4: { days: '61-80', focus: 'Usability Testing, Case Studies, Portfolio' },
      phase5: { days: '81-90', focus: 'Interview prep, Portfolio polish, Applications' }
    }
  }

  const roleData = progressions[role] || 
    progressions.fullstack
  
  // Find current phase
  const dayNum = parseInt(day)
  let currentPhase = roleData.phase1
  
  if (dayNum <= 20) currentPhase = roleData.phase1
  else if (dayNum <= 40) currentPhase = roleData.phase2
  else if (dayNum <= 60) currentPhase = roleData.phase3
  else if (dayNum <= 80) currentPhase = roleData.phase4
  else currentPhase = roleData.phase5

  return currentPhase
}

// Check if exam is coming up soon
export function getExamPressure(examDates) {
  if (!examDates?.length) return null
  
  const today = new Date()
  const upcoming = examDates.find(exam => {
    const examDate = new Date(exam.date)
    const daysUntil = Math.ceil(
      (examDate - today) / (1000 * 60 * 60 * 24))
    return daysUntil > 0 && daysUntil <= 7
  })
  
  if (upcoming) {
    const daysUntil = Math.ceil(
      (new Date(upcoming.date) - today) / 
      (1000 * 60 * 60 * 24))
    return { 
      subject: upcoming.subject, 
      daysUntil,
      isUrgent: daysUntil <= 3
    }
  }
  return null
}
