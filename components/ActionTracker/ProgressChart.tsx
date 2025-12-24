'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ProgressChartProps {
    data: { day: number; completed: number; total: number }[]
    currentDay: number
}

export function ProgressChart({ data, currentDay }: ProgressChartProps) {
    const chartData = data.map(d => ({
        day: d.day,
        percentage: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
        completed: d.completed,
        total: d.total,
    }))

    const visibleData = chartData.filter(d => d.day <= currentDay)
    const totalCompletions = visibleData.reduce((sum, d) => sum + d.completed, 0)
    const totalPossible = visibleData.reduce((sum, d) => sum + d.total, 0)
    const overallPercentage = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0
    const perfectDays = visibleData.filter(d => d.percentage === 100).length

    return (
        <div className="relative rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 p-4 sm:p-6 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                    <h2 className="font-semibold mb-0.5 sm:mb-1">Monthly Progress</h2>
                    <p className="text-xs sm:text-sm text-zinc-500">{currentDay} days into December</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl sm:text-3xl font-bold tracking-tight ${overallPercentage >= 80 ? 'text-emerald-400' :
                            overallPercentage >= 50 ? 'text-amber-400' :
                                'text-zinc-400'
                        }`}>
                        {overallPercentage}%
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-600">overall</p>
                </div>
            </div>

            {/* Chart */}
            <div className="h-32 sm:h-40 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visibleData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#52525b', fontSize: 10 }}
                            tickFormatter={(v) => v % 5 === 0 ? v : ''}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#52525b', fontSize: 10 }}
                            domain={[0, 100]}
                            tickFormatter={(v) => v === 100 ? '100' : v === 50 ? '50' : ''}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#18181b',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 600 }}
                            itemStyle={{ color: '#a78bfa' }}
                            formatter={(value: number | undefined) => [`${value ?? 0}%`, '']}
                            labelFormatter={(label) => `Day ${label}`}
                        />
                        <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke="url(#strokeGradient)"
                            strokeWidth={2}
                            fill="url(#chartGradient)"
                            dot={false}
                            activeDot={{ fill: '#c084fc', strokeWidth: 0, r: 5 }}
                        />
                        <defs>
                            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t border-white/5">
                <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                        {totalCompletions}
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-600">completed</div>
                </div>
                <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {perfectDays}
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-600">perfect days</div>
                </div>
                <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-zinc-500">
                        {totalPossible - totalCompletions}
                    </div>
                    <div className="text-[10px] sm:text-xs text-zinc-600">missed</div>
                </div>
            </div>
        </div>
    )
}
