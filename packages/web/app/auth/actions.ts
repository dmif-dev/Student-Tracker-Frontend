'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Update user metadata with role if it doesn't exist or just use it for redirection
  // In a real app, you'd check the role from a profiles table
  
  revalidatePath('/', 'layout')
  
  // Custom redirection based on role
  if (role === 'Student') {
    redirect('/Student/dashboard')
  } else if (role === 'Mentor') {
    redirect('/mentor/notifications')
  } else if (role === 'Admin') {
    redirect('/admin/students')
  } else {
    redirect('/')
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = formData.get('role') as string
  
  // Get the site URL for redirect after email verification
  const origin = (await import('next/headers')).headers().get('origin')

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        role: role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If Supabase is configured to require email verification,
  // session will be null and we should inform the user.
  if (data.user && !data.session) {
    return { success: 'Please check your email to verify your account.' }
  }

  revalidatePath('/', 'layout')
  
  // Custom redirection based on role
  if (role === 'Student') {
    redirect('/Student/dashboard')
  } else if (role === 'Mentor') {
    redirect('/mentor/notifications')
  } else if (role === 'Admin') {
    redirect('/admin/students')
  } else {
    redirect('/')
  }
}

export async function signInWithGoogle() {
  const supabase = createClient()
  
  // Get the site URL for redirect
  const origin = (await import('next/headers')).headers().get('origin')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
