'use client'

import { createClient } from './client'

const supabase = createClient()

export interface Action {
    action_id: string
    action_title: string
    month: string | null
    user_id: string
    created_at: string
}

export interface ActionCompletion {
    completion_id: string
    action_id: string
    user_id: string
    year: number
    month: number
    day: number
    completed: boolean
    notes: string | null
    created_at: string
}

export interface ActionWithCompletions extends Action {
    completions: number[]
}

// Get all actions for a user with their completions for a specific month
export async function getActionsWithCompletions(
    userId: string,
    year: number,
    month: number
): Promise<ActionWithCompletions[]> {
    // Get all actions for the user
    const { data: actions, error: actionsError } = await supabase
        .from('actions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

    if (actionsError) throw new Error(actionsError.message)
    if (!actions) return []

    // Get completions for these actions in the specified month
    const actionIds = actions.map(a => a.action_id)

    const { data: completions, error: completionsError } = await supabase
        .from('action_completions')
        .select('*')
        .in('action_id', actionIds)
        .eq('year', year)
        .eq('month', month)
        .eq('completed', true)

    if (completionsError) throw new Error(completionsError.message)

    // Map completions to actions
    return actions.map(action => ({
        ...action,
        completions: (completions || [])
            .filter(c => c.action_id === action.action_id)
            .map(c => c.day)
            .sort((a, b) => a - b)
    }))
}

// Create a new action
export async function createAction(userId: string, title: string): Promise<Action> {
    const { data, error } = await supabase
        .from('actions')
        .insert({
            user_id: userId,
            action_title: title,
        })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

// Delete an action
export async function deleteAction(actionId: string): Promise<void> {
    const { error } = await supabase
        .from('actions')
        .delete()
        .eq('action_id', actionId)

    if (error) throw new Error(error.message)
}

// Toggle a day's completion status
export async function toggleDayCompletion(
    actionId: string,
    userId: string,
    year: number,
    month: number,
    day: number
): Promise<boolean> {
    // Check if completion exists (use maybeSingle to avoid 406 when no row exists)
    const { data: existing, error: fetchError } = await supabase
        .from('action_completions')
        .select('completion_id, completed')
        .eq('action_id', actionId)
        .eq('year', year)
        .eq('month', month)
        .eq('day', day)
        .maybeSingle()

    if (existing) {
        // Toggle existing completion
        const { error } = await supabase
            .from('action_completions')
            .update({ completed: !existing.completed })
            .eq('completion_id', existing.completion_id)

        if (error) throw new Error(error.message)
        return !existing.completed
    } else {
        // Create new completion
        const { error } = await supabase
            .from('action_completions')
            .insert({
                action_id: actionId,
                user_id: userId,
                year,
                month,
                day,
                completed: true,
            })

        if (error) throw new Error(error.message)
        return true
    }
}

// Get monthly statistics for progress chart
export async function getMonthlyStats(
    userId: string,
    year: number,
    month: number
): Promise<{ day: number; completed: number; total: number }[]> {
    const { data: actions } = await supabase
        .from('actions')
        .select('action_id')
        .eq('user_id', userId)

    if (!actions || actions.length === 0) return []

    const totalActions = actions.length
    const actionIds = actions.map(a => a.action_id)

    const { data: completions } = await supabase
        .from('action_completions')
        .select('day')
        .in('action_id', actionIds)
        .eq('year', year)
        .eq('month', month)
        .eq('completed', true)

    // Get days in month
    const daysInMonth = new Date(year, month, 0).getDate()

    // Count completions per day
    const completionsByDay: Record<number, number> = {}
    completions?.forEach(c => {
        completionsByDay[c.day] = (completionsByDay[c.day] || 0) + 1
    })

    // Generate stats for each day
    return Array.from({ length: daysInMonth }, (_, i) => ({
        day: i + 1,
        completed: completionsByDay[i + 1] || 0,
        total: totalActions,
    }))
}

// Get overall user stats for dashboard
export async function getUserStats(userId: string): Promise<{
    totalDaysTracked: number
    overallCompletion: number
    currentStreak: number
    perfectDays: number
}> {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    // Get all actions
    const { data: actions } = await supabase
        .from('actions')
        .select('action_id')
        .eq('user_id', userId)

    if (!actions || actions.length === 0) {
        return { totalDaysTracked: currentDay, overallCompletion: 0, currentStreak: 0, perfectDays: 0 }
    }

    const actionIds = actions.map(a => a.action_id)
    const totalActions = actions.length

    // Get all completions for current month
    const { data: completions } = await supabase
        .from('action_completions')
        .select('day')
        .in('action_id', actionIds)
        .eq('year', currentYear)
        .eq('month', currentMonth)
        .eq('completed', true)

    // Calculate completions by day
    const completionsByDay: Record<number, number> = {}
    completions?.forEach(c => {
        completionsByDay[c.day] = (completionsByDay[c.day] || 0) + 1
    })

    // Calculate overall completion
    const totalPossible = currentDay * totalActions
    const totalCompleted = completions?.length || 0
    const overallCompletion = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

    // Calculate perfect days
    let perfectDays = 0
    for (let day = 1; day <= currentDay; day++) {
        if ((completionsByDay[day] || 0) === totalActions) {
            perfectDays++
        }
    }

    // Calculate current streak
    let currentStreak = 0
    for (let day = currentDay; day >= 1; day--) {
        if ((completionsByDay[day] || 0) > 0) {
            currentStreak++
        } else {
            break
        }
    }

    return {
        totalDaysTracked: currentDay,
        overallCompletion,
        currentStreak,
        perfectDays,
    }
}

