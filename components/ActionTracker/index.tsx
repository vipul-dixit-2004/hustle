'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Plus, Lock } from 'lucide-react'
import { ActionRow, AddActionForm } from './ActionRow'
import { ProgressChart } from './ProgressChart'
import {
    getActionsWithCompletions,
    createAction,
    deleteAction,
    toggleDayCompletion,
    getMonthlyStats,
    type ActionWithCompletions,
} from '@/lib/supabase/actions'

interface ActionTrackerProps {
    userId: string
    onStatsUpdate?: () => void
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
]

export function ActionTracker({ userId, onStatsUpdate }: ActionTrackerProps) {
    const today = new Date()
    const [year, setYear] = useState(today.getFullYear())
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [actions, setActions] = useState<ActionWithCompletions[]>([])
    const [stats, setStats] = useState<{ day: number; completed: number; total: number }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const daysInMonth = new Date(year, month, 0).getDate()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const currentDay = isCurrentMonth ? today.getDate() : daysInMonth

    // Check if viewing a future month
    const isFutureMonth = year > today.getFullYear() ||
        (year === today.getFullYear() && month > today.getMonth() + 1)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const [actionsData, statsData] = await Promise.all([
                getActionsWithCompletions(userId, year, month),
                getMonthlyStats(userId, year, month),
            ])
            setActions(actionsData)
            setStats(statsData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }, [userId, year, month])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handlePrevMonth = () => {
        if (month === 1) {
            setYear(year - 1)
            setMonth(12)
        } else {
            setMonth(month - 1)
        }
    }

    const handleNextMonth = () => {
        // Allow navigating to next month but add indication it's future
        if (month === 12) {
            setYear(year + 1)
            setMonth(1)
        } else {
            setMonth(month + 1)
        }
    }

    const handleAddAction = async (title: string) => {
        try {
            await createAction(userId, title)
            await fetchData()
            onStatsUpdate?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add action')
        }
    }

    const handleDeleteAction = async (actionId: string) => {
        try {
            await deleteAction(actionId)
            setActions(prev => prev.filter(a => a.action_id !== actionId))
            onStatsUpdate?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete action')
        }
    }

    const handleToggleDay = async (actionId: string, day: number) => {
        // Prevent toggling in future months
        if (isFutureMonth) return

        try {
            const newCompleted = await toggleDayCompletion(actionId, userId, year, month, day)

            setActions(prev => prev.map(action => {
                if (action.action_id !== actionId) return action

                const completions = newCompleted
                    ? [...action.completions, day].sort((a, b) => a - b)
                    : action.completions.filter(d => d !== day)

                return { ...action, completions }
            }))

            setStats(prev => prev.map(stat => {
                if (stat.day !== day) return stat
                return {
                    ...stat,
                    completed: newCompleted ? stat.completed + 1 : stat.completed - 1
                }
            }))

            // Refresh dashboard stats
            onStatsUpdate?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle day')
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Month Selector */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
                    >
                        <ChevronLeft className="w-5 h-5 text-zinc-500" />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                            <span className="sm:hidden">{MONTH_NAMES[month - 1]} {year}</span>
                            <span className="hidden sm:inline">{MONTH_NAMES_FULL[month - 1]} {year}</span>
                        </h1>
                        {isFutureMonth && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-800 rounded-full">
                                <Lock className="w-3 h-3 text-zinc-500" />
                                <span className="text-[10px] text-zinc-500 font-medium">FUTURE</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
                    >
                        <ChevronRight className="w-5 h-5 text-zinc-500" />
                    </button>
                </div>
                <span className="text-xs sm:text-sm text-zinc-600">{daysInMonth} days</span>
            </div>

            {/* Future month warning */}
            {isFutureMonth && (
                <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>You can&apos;t edit future months. Navigate to the current or past months to track habits.</span>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Progress Chart */}
            <ProgressChart data={stats} currentDay={isFutureMonth ? 0 : currentDay} />

            {/* Actions */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-medium text-sm sm:text-base">Habits</h2>
                    <span className="text-xs sm:text-sm text-zinc-600">{actions.length} total</span>
                </div>

                <div className="p-4 sm:p-5">
                    {/* Add Form - disabled for future months */}
                    {!isFutureMonth && (
                        <div className="mb-4">
                            <AddActionForm onAdd={handleAddAction} />
                        </div>
                    )}

                    {/* List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                        </div>
                    ) : actions.length === 0 ? (
                        <div className="text-center py-10 sm:py-12 text-zinc-600">
                            <Plus className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p className="text-sm sm:text-base">No habits yet</p>
                            <p className="text-xs sm:text-sm text-zinc-700">Add your first one above</p>
                        </div>
                    ) : (
                        <div className="space-y-1 sm:space-y-2">
                            {/* Desktop Header */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs text-zinc-600">
                                <div className="w-44 shrink-0">Habit</div>
                                <div className="flex-1 text-center">1 — {daysInMonth}</div>
                                <div className="w-16 text-right">Done</div>
                            </div>

                            {actions.map(action => (
                                <ActionRow
                                    key={action.action_id}
                                    action={action}
                                    year={year}
                                    month={month}
                                    daysInMonth={daysInMonth}
                                    onToggleDay={handleToggleDay}
                                    onDelete={handleDeleteAction}
                                    disabled={isFutureMonth}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
