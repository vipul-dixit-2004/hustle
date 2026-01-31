'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Code2, CheckCircle2, ExternalLink } from 'lucide-react'

interface LeetSub {
    id: number | string
    title: string
    titleSlug: string
    timestamp: number
    statusDisplay: string
    lang?: string
    difficulty?: 'Easy' | 'Medium' | 'Hard' | string
}

interface LeetTotalStats {
    total: number
    easy: number
    medium: number
    hard: number
}

interface LeetCodeStatsProps {
    username: string
}

export function LeetCodeStats({ username }: LeetCodeStatsProps) {
    const [submissions, setSubmissions] = useState<LeetSub[] | null>(null)
    const [totalStats, setTotalStats] = useState<LeetTotalStats | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username)}`)
            if (!res.ok) {
                console.error('LeetCode API error', await res.text())
                return
            }
            const json = await res.json()
            const items: LeetSub[] = (json?.submissions || [])

            // Capture total stats
            if (json?.totalStats) {
                setTotalStats(json.totalStats)
            }

            // Filter to submissions from today that are Accepted
            const today = new Date()
            const todayStr = today.toDateString()
            const todays = items.filter(it => {
                const ts = Number(it.timestamp) * 1000
                const d = new Date(ts)
                return d.toDateString() === todayStr && it.statusDisplay === 'Accepted'
            })

            // Deduplicate by titleSlug (keep first occurrence)
            const seen = new Set<string>()
            const unique = todays.filter(it => {
                if (seen.has(it.titleSlug)) return false
                seen.add(it.titleSlug)
                return true
            })

            setSubmissions(unique)
        } catch (err) {
            console.error('Failed to fetch LeetCode submissions:', err)
        }
    }, [username])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <div className="mb-4 sm:mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                        <Code2 className="w-4 h-4 text-orange-400" />
                    </div>
                    <h2 className="text-base font-semibold">LeetCode Today</h2>
                </div>
                <a
                    href={`https://leetcode.com/u/${username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                    @{username}
                    <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-white/5 backdrop-blur-sm">
                {/* Overall stats with pie chart */}
                {totalStats && totalStats.total > 0 && (() => {
                    const total = totalStats.easy + totalStats.medium + totalStats.hard
                    const easyPct = (totalStats.easy / total) * 100
                    const medPct = (totalStats.medium / total) * 100
                    // Conic gradient: Easy (green), Medium (amber), Hard (red)
                    const conicGradient = `conic-gradient(
                        #10b981 0% ${easyPct}%,
                        #f59e0b ${easyPct}% ${easyPct + medPct}%,
                        #ef4444 ${easyPct + medPct}% 100%
                    )`
                    return (
                        <div className="mb-4 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-6">
                                {/* Pie chart */}
                                <div className="relative w-24 h-24 shrink-0">
                                    <div
                                        className="w-full h-full rounded-full"
                                        style={{ background: conicGradient }}
                                    />
                                    {/* Center hole */}
                                    <div className="absolute inset-2 rounded-full bg-zinc-900 flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="text-lg font-bold text-white">{totalStats.total}</div>
                                            <div className="text-[10px] text-zinc-500">solved</div>
                                        </div>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <span className="text-sm text-zinc-400">Easy</span>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-400">{totalStats.easy}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <span className="text-sm text-zinc-400">Medium</span>
                                        </div>
                                        <span className="text-sm font-semibold text-amber-400">{totalStats.medium}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span className="text-sm text-zinc-400">Hard</span>
                                        </div>
                                        <span className="text-sm font-semibold text-red-400">{totalStats.hard}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })()}

                {submissions === null ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800/50 flex items-center justify-center">
                            <Code2 className="w-6 h-6 text-zinc-600" />
                        </div>
                        <p className="text-sm text-zinc-500">No accepted submissions today</p>
                        <p className="text-xs text-zinc-600 mt-1">Solve a problem to see it here!</p>
                    </div>
                ) : (
                    <>
                        {/* Today's stats summary */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                <span className="text-lg font-bold text-white">{submissions.length}</span>
                                <span className="text-sm text-zinc-500">solved today</span>
                            </div>
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    {submissions.filter(s => s.difficulty === 'Easy').length} Easy
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    {submissions.filter(s => s.difficulty === 'Medium').length} Med
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                    {submissions.filter(s => s.difficulty === 'Hard').length} Hard
                                </span>
                            </div>
                        </div>

                        {/* Problem list */}
                        <ul className="space-y-2">
                            {submissions.map(s => {
                                const diffColor = s.difficulty === 'Easy' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                    : s.difficulty === 'Medium' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                                        : s.difficulty === 'Hard' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                                            : 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20'
                                return (
                                    <li key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors group">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <a
                                                href={`https://leetcode.com/problems/${s.titleSlug}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-white hover:text-orange-400 transition-colors font-medium truncate block"
                                            >
                                                {s.title}
                                            </a>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-zinc-500">{s.lang}</span>
                                                <span className="text-zinc-700">•</span>
                                                <span className="text-xs text-zinc-500">{new Date(Number(s.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border shrink-0 ${diffColor}`}>
                                            {s.difficulty}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    </>
                )}
            </div>
        </div>
    )
}
