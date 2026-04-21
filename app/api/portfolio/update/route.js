export const dynamic = "force-dynamic";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'


export async function PUT(request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await request.json()
  const {
    bio, tagline, github_url, linkedin_url,
    twitter_url, website_url, projects,
    template_id, is_public, public_slug
  } = data

  if (public_slug) {
    const { data: existing } = await supabase
      .from('portfolios')
      .select('id')
      .eq('public_slug', public_slug)
      .neq('user_id', user.id)
      .single()

    if (existing) return NextResponse.json({ error: 'URL already taken' }, { status: 409 })
  }

  const { data: portfolio, error } = await supabase
    .from('portfolios')
    .update({
      bio, tagline, github_url, linkedin_url, twitter_url, website_url,
      projects: projects || [], template_id, is_public, public_slug,
      last_updated: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', user.id)

  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_type: 'portfolio_update',
    event_data: { template_id }
  })

  return NextResponse.json({ success: true, portfolio })
}
