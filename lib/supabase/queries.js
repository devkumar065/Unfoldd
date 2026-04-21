import { supabase } from './client'

export async function getUserProfile(userId) {
  return await supabase.from('profiles').select('*').eq('id', userId).single()
}

export async function updateUserProfile(userId, data) {
  return await supabase.from('profiles').update(data).eq('id', userId)
}

export async function getRoadmap(userId) {
  return await supabase.from('roadmaps').select('*').eq('user_id', userId).eq('is_active', true).single()
}

export async function getTodaysMission(userId, dayNumber) {
  return await supabase.from('daily_missions').select('*, video_id(*)').eq('user_id', userId).eq('day_number', dayNumber).single()
}

export async function updateMissionStatus(missionId, status) {
  return await supabase.from('daily_missions').update({ status }).eq('id', missionId)
}

export async function getVideoProgress(userId, videoId) {
  return await supabase.from('video_progress').select('*').eq('user_id', userId).eq('video_id', videoId).single()
}

export async function upsertVideoProgress(userId, videoId, data) {
  return await supabase.from('video_progress').upsert({ user_id: userId, video_id: videoId, ...data }, { onConflict: 'user_id, video_id' })
}

export async function getTestAttempt(userId, testId) {
  return await supabase.from('test_attempts').select('*').eq('user_id', userId).eq('test_id', testId).single()
}

export async function createTestAttempt(data) {
  return await supabase.from('test_attempts').insert([data])
}

export async function updateTestAttempt(attemptId, data) {
  return await supabase.from('test_attempts').update(data).eq('id', attemptId)
}

export async function getSkills(userId) {
  return await supabase.from('skills').select('*').eq('user_id', userId)
}

export async function upsertSkill(userId, skillName, data) {
  return await supabase.from('skills').upsert({ user_id: userId, skill_name: skillName, ...data }, { onConflict: 'user_id, skill_name' })
}

export async function generateExamLink(userId, skillId, token, expiresAt) {
  return await supabase.from('exams').insert([{ user_id: userId, skill_id: skillId, exam_link_token: token, expires_at: expiresAt }])
}

export async function validateExamToken(token) {
  return await supabase.from('exams').select('*, skill_id(*)').eq('exam_link_token', token).single()
}

export async function getPortfolio(slug) {
  return await supabase.from('portfolios').select('*, user_id(full_name, avatar_url)').eq('public_slug', slug).single()
}

export async function updatePortfolio(userId, data) {
  return await supabase.from('portfolios').update(data).eq('user_id', userId)
}

export async function getResume(userId) {
  return await supabase.from('resumes').select('*').eq('user_id', userId).single()
}

export async function updateResume(userId, data) {
  return await supabase.from('resumes').update(data).eq('user_id', userId)
}

export async function getMatchedInternships(userId, skills, role) {
  // Simplified matching for now - in production this would be a custom RPC or complex query
  return await supabase.from('internships').select('*').eq('is_active', true).eq('role', role)
}

export async function applyToInternship(userId, internshipId, matchPct) {
  return await supabase.from('internship_applications').insert([{ user_id: userId, internship_id: internshipId, match_percentage: matchPct }])
}

export async function getNotifications(userId) {
  return await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false })
}

export async function markNotificationRead(notificationId) {
  return await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
}

export async function trackAnalyticsEvent(userId, eventType, eventData) {
  return await supabase.from('analytics_events').insert([{ user_id: userId, event_type: eventType, event_data: eventData }])
}