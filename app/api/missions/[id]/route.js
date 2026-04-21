import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const { id } = params;
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { build_completed, apply_completed } = body;



  // Get current mission to check video_completed and current status
  const { data: current, error: fetchError } = await supabase
    .from('daily_missions')
    .select('video_completed, status')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error(`[SYNC ERROR] Fetching mission ${id} failed:`, fetchError);
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }

  let newStatus = current?.status || 'pending';
  if (newStatus !== 'completed') {
    const anyTaskDone = build_completed || apply_completed || current?.video_completed;
    newStatus = anyTaskDone ? 'in_progress' : 'pending';
  }



  const { data, error } = await supabase
    .from('daily_missions')
    .update({
      build_completed,
      apply_completed,
      status: newStatus
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Database update error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, mission: data });
}
