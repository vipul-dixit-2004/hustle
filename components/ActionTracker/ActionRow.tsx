'use client'

import { useState } from 'react'
import { Plus, X, Check, Loader2, Sparkles } from 'lucide-react'
import type { ActionWithCompletions } from '@/lib/supabase/actions'

interface ActionRowProps {
    action: ActionWithCompletions
    year: number
    month: number
    daysInMonth: number
    onToggleDay: (actionId: string, day: number) => Promise<void>
    onDelete: (actionId: string) => Promise<void>
    disabled?: boolean
}

export function ActionRow({
    action,
    year,
    month,
    daysInMonth,
    onToggleDay,
    onDelete,
    disabled = false
}: ActionRowProps) {
    const [loadingDay, setLoadingDay] = useState<number | null>(null)
    const [deleting, setDeleting] = useState(false)
    const today = new Date()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
    const currentDay = today.getDate()

    const handleToggle = async (day: number) => {
        if (disabled) return
        setLoadingDay(day)
        try {
            await onToggleDay(action.action_id, day)
        } finally {
            setLoadingDay(null)
        }
    }

    const handleDelete = async () => {
        if (disabled) return
        setDeleting(true)
        try {
            await onDelete(action.action_id)
        } finally {
            setDeleting(false)
        }
    }

    const completionRate = Math.round((action.completions.length / daysInMonth) * 100)
    const isPerfect = completionRate === 100

    return (
        <div className={`p-3 rounded-xl transition-all group ${isPerfect
                ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20'
                : 'hover:bg-white/[0.03]'
            } ${disabled ? 'opacity-60' : ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Action Title Row */}
                <div className="flex items-center justify-between sm:justify-start sm:w-44 shrink-0">
                    <div className="flex items-center gap-2">
                        {!disabled && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="sm:opacity-0 sm:group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                            >
                                {deleting ? (
                                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                                ) : (
                                    <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                                )}
                            </button>
                        )}
                        <span className="text-sm text-zinc-200 truncate max-w-[150px] sm:max-w-[130px] font-medium">
                            {action.action_title}
                        </span>
                        {isPerfect && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    {/* Mobile: Show rate inline */}
                    <div className={`sm:hidden px-2 py-0.5 rounded-full text-xs font-medium ${completionRate >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : completionRate >= 50
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-zinc-500/20 text-zinc-400'
                        }`}>
                        {completionRate}%
                    </div>
                </div>

                {/* Day Checkboxes */}
                <div className="flex gap-0.5 overflow-x-auto pb-2 sm:pb-0 flex-1 -mx-1 px-1">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const isCompleted = action.completions.includes(day)
                        const isToday = isCurrentMonth && day === currentDay
                        const isFuture = isCurrentMonth && day > currentDay
                        const isLoading = loadingDay === day
                        const isDisabled = disabled || isFuture

                        return (
                            <button
                                key={day}
                                onClick={() => handleToggle(day)}
                                disabled={isLoading || isDisabled}
                                className={`
                  w-7 h-7 sm:w-6 sm:h-6 shrink-0 rounded-md text-[11px] sm:text-[10px] font-medium transition-all
                  flex items-center justify-center touch-manipulation
                  ${isToday ? 'ring-2 ring-purple-500/50 ring-offset-1 ring-offset-[#09090b]' : ''}
                  ${isCompleted
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25'
                                        : isDisabled
                                            ? 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed'
                                            : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300 active:scale-95'
                                    }
                `}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                ) : isCompleted ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    day
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Desktop: Completion Rate */}
                <div className={`hidden sm:flex items-center justify-end w-16 shrink-0`}>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${completionRate >= 80
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : completionRate >= 50
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-zinc-500/20 text-zinc-400'
                        }`}>
                        {completionRate}%
                    </div>
                </div>
            </div>
        </div>
    )
}

// Add Action Form
interface AddActionFormProps {
    onAdd: (title: string) => Promise<void>
}

export function AddActionForm({ onAdd }: AddActionFormProps) {
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        setLoading(true)
        try {
            await onAdd(title.trim())
            setTitle('')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add new habit..."
                className="flex-1 px-4 py-2.5 sm:py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/25 transition-all"
            />
            <button
                type="submit"
                disabled={loading || !title.trim()}
                className="px-4 sm:px-4 py-2.5 sm:py-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:from-zinc-700 disabled:to-zinc-700 flex items-center gap-1.5 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Plus className="w-4 h-4" />
                )}
                <span>Add</span>
            </button>
        </form>
    )
}
