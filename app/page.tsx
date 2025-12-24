import Link from 'next/link'
import { ArrowRight, CheckCircle2, Zap, Target, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Minimal grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px'
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">Hustle</span>
        </div>

        <Link
          href="/login"
          className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Track your daily habits
          </div>
        </div>

        {/* Main headline */}
        <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Build habits that
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            actually stick
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-center text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto mb-12 leading-relaxed">
          Simple daily tracking. Beautiful progress charts.
          No complexity, just results.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/signup"
            className="group flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition-all"
          >
            Start for free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 text-zinc-400 font-medium hover:text-white transition-colors"
          >
            I have an account
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Daily Checkboxes</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Track habits with a simple click. See your month at a glance.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="font-semibold mb-2">Progress Charts</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Visualize your consistency with beautiful analytics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2">Stay Consistent</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Build streaks and never break the chain.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-zinc-600">
          <span>© 2024 Hustle</span>
          <span>Built with focus</span>
        </div>
      </footer>
    </div>
  )
}
