export function generateSlug(fullName) {
  const base = fullName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${base}-${random}`
}

export async function ensureUniqueSlug(supabase, fullName, userId) {
  let slug = generateSlug(fullName)
  let attempts = 0
  
  while (attempts < 5) {
    const { data } = await supabase
      .from('portfolios')
      .select('id')
      .eq('public_slug', slug)
      .neq('user_id', userId)
      .single()
    
    if (!data) return slug
    
    slug = generateSlug(fullName)
    attempts++
  }
  return slug
}
