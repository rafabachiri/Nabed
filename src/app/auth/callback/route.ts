import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function generateUsername(email: string): string {
  const prefix = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 14)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${prefix}_${suffix}`
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_code', origin))
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(new URL('/auth/login?error=verification_failed', origin))
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', origin))
  }

  const admin = createAdminClient()

  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id, role, status')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    if (existingProfile.role === 'teacher' && existingProfile.status === 'pending') {
      return NextResponse.redirect(new URL('/auth/pending', origin))
    }
    return NextResponse.redirect(new URL(next, origin))
  }

  // Create profile from user metadata set during sign-up
  const meta = (user.user_metadata ?? {}) as Record<string, string>
  const role = meta.role ?? 'student'

  const profileData: Record<string, unknown> = {
    id: user.id,
    role,
    username: generateUsername(user.email ?? 'user'),
    full_name: meta.full_name ?? '',
    university: meta.university ?? null,
    status: role === 'teacher' ? 'pending' : 'active',
  }

  if (role === 'student') {
    profileData.year_of_study = meta.year_of_study ? parseInt(meta.year_of_study) : null
    profileData.specialty = meta.specialty ?? null
  } else if (role === 'teacher') {
    profileData.department = meta.department ?? null
    profileData.faculty_id = meta.faculty_id ?? null
  }

  await admin.from('profiles').insert(profileData)

  if (role === 'student' && meta.class_join_code) {
    const { data: cls } = await admin
      .from('classes')
      .select('id')
      .eq('join_code', meta.class_join_code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (cls) {
      await admin.from('class_students').insert({ class_id: cls.id, student_id: user.id })
    }
  }

  if (role === 'teacher') {
    return NextResponse.redirect(new URL('/auth/pending', origin))
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}
