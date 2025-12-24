'use client'

import { createClient } from './client'

const supabase = createClient()

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        throw new Error(error.message)
    }

    return data
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error(error.message)
    }
}

export async function getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
        return null
    }

    return user
}

export function onAuthStateChange(callback: (user: unknown) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(session?.user ?? null)
    })
}
