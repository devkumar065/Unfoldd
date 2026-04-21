import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function logAdminAction({
  adminId,
  action,
  targetType,  // 'user' | 'exam' | 'video' | 'setting'
  targetId,
  details,
  ipAddress
}) {
  try {
    await supabaseAdmin
      .from('analytics_events')
      .insert({
        user_id: adminId,
        event_type: `admin_${action}`,
        event_data: {
          admin_id: adminId,
          target_type: targetType,
          target_id: targetId,
          details,
          ip: ipAddress || 'unknown',
          timestamp: new Date().toISOString()
        }
      })
  } catch(err) {
    console.error('Audit log error:', err)
  }
}

// Get audit log for admin panel
export async function getAuditLog(limit = 100, offset = 0) {
  const { data } = await supabaseAdmin
    .from('analytics_events')
    .select('*')
    .like('event_type', 'admin_%')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  return data
}
