import { SignInButton } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Monitor,
  Octagon,
  Phone,
  Radio,
  Route as RouteIcon,
  Send,
  Smartphone,
  Star,
  StickyNote,
  TrendingDown,
  XCircle,
  Zap,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

/* ── Data ── */

const benefits = [
  {
    icon: Zap,
    title: 'Operational Efficiency',
    description:
      'Consolidate phones, radios, legacy PMS, and messaging into one platform. Reduce manual work and missed requests.',
  },
  {
    icon: LayoutDashboard,
    title: 'Real-Time Visibility',
    description:
      'Live dashboards show request status, ownership, and SLA risks across front desk, housekeeping, maintenance, and F&B.',
  },
  {
    icon: Building2,
    title: 'Enterprise for Boutiques',
    description:
      "Command-center capabilities that independent properties couldn't otherwise build in-house.",
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Decisions',
    description:
      'Actionable analytics on service performance and guest needs. Improve quality and prevent recurring issues.',
  },
  {
    icon: Heart,
    title: 'Higher Guest Satisfaction',
    description:
      'Every request becomes a closed-loop, trackable task. Nothing falls through the cracks.',
  },
]

const steps = [
  {
    icon: Send,
    n: '01',
    title: 'Guest submits a request',
    description:
      'Via mobile, in-room tablet, or front desk — structured and categorized automatically.',
  },
  {
    icon: RouteIcon,
    n: '02',
    title: 'Smart routing & assignment',
    description:
      'Requests land with the right team member instantly. No radio tag, no sticky notes.',
  },
  {
    icon: CheckCircle2,
    n: '03',
    title: 'Track, resolve, close the loop',
    description:
      'Real-time status for staff and operators. Every request is accountable.',
  },
]

const chaos = [
  { icon: Phone, label: 'Phone calls' },
  { icon: Radio, label: 'Radios' },
  { icon: StickyNote, label: 'Sticky notes' },
  { icon: Monitor, label: 'Legacy PMS' },
]

const testimonials = [
  {
    quote:
      "We replaced three separate tools with SelfServe. Response time dropped by half and guest complaints about lost requests went to basically zero.",
    name: 'Jordan M.',
    role: 'Operations Manager',
    hotel: 'The Piedmont Hotel',
    initials: 'JM',
  },
  {
    quote:
      "Our front desk used to spend 40 minutes a shift just relaying requests over the radio. Now it's all routed automatically. The team actually trusts the system.",
    name: 'Priya S.',
    role: 'General Manager',
    hotel: 'Wren & Fig Boutique',
    initials: 'PS',
  },
  {
    quote:
      "For the first time I can see what's happening on property in real time without calling three departments. That alone was worth the switch.",
    name: 'David L.',
    role: 'Owner-Operator',
    hotel: 'The Larchmont',
    initials: 'DL',
  },
]

const beforeItems = [
  'Requests lost between handoffs',
  'No visibility until someone complains',
  'Staff juggling 4+ disconnected tools',
  'Manual tracking, if any at all',
  'Recurring issues go unnoticed',
]

const afterItems = [
  'Every request structured and assigned',
  'Real-time dashboards for operators',
  'One platform for every department',
  'Closed-loop tracking on every task',
  'Data to prevent problems before they repeat',
]

/* ── Component ── */

function App() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans selection:bg-primary/20 selection:text-primary">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-stone-200/60 bg-[#FAFAF8]/80 backdrop-blur-xl">
        <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-[34px] rounded-[9px] bg-primary flex items-center justify-center">
              <Octagon
                className="size-[17px] text-white"
                fill="white"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-stone-900 font-playfair">
              SelfServe
            </span>
          </div>
          <div className="flex items-center gap-2">
            <SignInButton>
              <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2">
                Sign In <ArrowRight className="size-3.5" />
              </button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-0 md:pt-44 px-6 overflow-hidden">
        {/* Warm gradient bleed */}
        <div className="absolute top-0 right-0 w-[55%] h-[60%] bg-gradient-to-bl from-[#F5F0EA] to-transparent pointer-events-none" />

        <div className="relative max-w-[1120px] mx-auto">
          {/* Copy — centered */}
          <div className="text-center max-w-[780px] mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary mb-5">
              The operations command center
            </p>
            <h1 className="text-[clamp(36px,5.5vw,68px)] font-bold tracking-tight text-stone-900 leading-[1.08] mb-6 font-playfair">
              Enterprise operations for the boutique hotel.
            </h1>
            <p className="text-lg md:text-xl text-stone-500 leading-relaxed max-w-[560px] mx-auto mb-10">
              Replace the patchwork of phones, radios, sticky notes, and legacy
              PMS screens with one structured, trackable command center.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <SignInButton>
                <button className="px-7 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[10px] transition-all shadow-lg shadow-primary/20 flex items-center gap-2 group">
                  Get Started
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </SignInButton>
            </div>
          </div>

          {/* Product screenshot — light cinematic frame */}
          <div className="relative mx-auto max-w-[1040px]">
            {/* Soft shadow underneath */}
            <div className="absolute -inset-x-8 -bottom-8 top-16 rounded-3xl bg-stone-900/[0.04] blur-2xl pointer-events-none" />
            {/* Frame */}
            <div className="relative rounded-t-2xl border border-b-0 border-stone-200 bg-white overflow-hidden shadow-xl shadow-stone-900/[0.08]">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100 bg-stone-50/80">
                <div className="flex gap-1.5">
                  <div className="size-[10px] rounded-full bg-stone-200" />
                  <div className="size-[10px] rounded-full bg-stone-200" />
                  <div className="size-[10px] rounded-full bg-stone-200" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-stone-100 text-stone-400 text-xs font-medium">
                    app.selfserve.com
                  </div>
                </div>
                <div className="w-[52px]" />
              </div>
              {/* Screenshot */}
              <img
                src="/home-page-ui.png"
                alt="SelfServe dashboard showing task management across departments"
                className="w-full block"
                loading="eager"
              />
            </div>
            {/* Bottom fade to blend into next section */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FAFAF8] to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-stone-200/80" />

      {/* ── PROBLEM ── */}
      <section className="py-24 md:py-28 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center max-w-[700px] mx-auto mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
              The reality
            </p>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold tracking-tight text-stone-900 leading-[1.12] mb-5 font-playfair">
              Guest expectations are rising. Your tools haven't kept up.
            </h2>
            <p className="text-[17px] text-stone-500 leading-relaxed">
              Staff juggle disconnected systems all shift long. Requests get lost
              between handoffs. Operators can't see what's happening without
              calling three departments. The problem isn't your people — it's
              that no single system was ever designed for how independent hotels
              actually run.
            </p>
          </div>

          {/* Chaos pills */}
          <div className="flex justify-center gap-3 flex-wrap mb-14">
            {chaos.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-[10px] bg-white border border-stone-200"
              >
                <Icon className="size-[18px] text-stone-400" strokeWidth={1.8} />
                <span className="text-sm font-medium text-stone-500">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Insight card */}
          <div className="max-w-[680px] mx-auto p-9 rounded-2xl bg-primary/[0.06] border-l-[3px] border-primary">
            <p className="text-[17px] text-primary font-medium leading-relaxed">
              SelfServe replaces all of it with one command center. Every guest
              request becomes a structured, assignable task — routed to the right
              person, tracked to resolution, visible in real time.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 md:py-28 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
              How it works
            </p>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold tracking-tight text-stone-900 leading-[1.12] max-w-[600px] mx-auto font-playfair">
              Three steps. Zero guesswork.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map(({ icon: Icon, n, title, description }) => (
              <div
                key={n}
                className="relative p-9 rounded-2xl bg-white border border-stone-200 overflow-hidden"
              >
                <span className="absolute top-5 right-6 text-[64px] font-extrabold leading-none text-stone-100 select-none font-playfair">
                  {n}
                </span>
                <div className="size-12 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-6">
                  <Icon className="size-[22px] text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-[19px] font-bold tracking-tight text-stone-900 mb-2.5 font-playfair">
                  {title}
                </h3>
                <p className="text-[15px] text-stone-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── BENEFITS ── */}
      <section className="py-24 md:py-28 px-6 bg-[#F5F0EA]">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
              Why SelfServe
            </p>
            <h2 className="text-[clamp(28px,3.6vw,44px)] font-bold tracking-tight text-stone-900 leading-[1.12] max-w-[640px] mx-auto font-playfair">
              Built for how hotels actually operate
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white border border-stone-200 hover:border-primary/30 hover:shadow-lg hover:shadow-stone-900/[0.03] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
              >
                <div className="size-[46px] rounded-xl bg-primary/[0.08] flex items-center justify-center mb-5">
                  <Icon className="size-[22px] text-primary" strokeWidth={2} />
                </div>
                <h3 className="text-[18px] font-bold tracking-tight text-stone-900 mb-2.5 font-playfair">
                  {title}
                </h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── BEFORE / AFTER ── */}
      <section className="py-24 md:py-28 px-6">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
              The shift
            </p>
            <h2 className="text-[clamp(28px,3.6vw,40px)] font-bold tracking-tight text-stone-900 leading-[1.12] max-w-[600px] mx-auto font-playfair">
              Two realities. One choice.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-[880px] mx-auto">
            {/* Before */}
            <div className="p-9 rounded-2xl bg-[#FDF6F0] border border-[#EDE5DD]">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#B8977A] mb-6">
                Without SelfServe
              </p>
              <div className="space-y-3.5">
                {beforeItems.map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <TrendingDown className="size-4 text-[#B8977A] mt-0.5 shrink-0" />
                    <span className="text-[15px] text-[#8A7B6B] leading-relaxed">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div className="p-9 rounded-2xl bg-primary/[0.06] border border-primary/10">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary mb-6">
                With SelfServe
              </p>
              <div className="space-y-3.5">
                {afterItems.map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-[15px] text-primary leading-relaxed">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 md:py-28 px-6 bg-[#F5F0EA]">
        <div className="max-w-[1120px] mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
              From operators like you
            </p>
            <h2 className="text-[clamp(28px,3.6vw,40px)] font-bold tracking-tight text-stone-900 leading-[1.12] max-w-[500px] mx-auto font-playfair">
              Real properties. Real results.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-2xl bg-white border border-stone-200 flex flex-col"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="size-3.5 text-amber-400"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-[15px] text-stone-600 leading-relaxed italic flex-1 mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-stone-500">
                      {t.role}, {t.hotel}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── PHILOSOPHY ── */}
      <section className="py-32 md:py-44 px-6 text-center">
        <div className="max-w-[720px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary mb-4">
            Our belief
          </p>
          <h2 className="text-[clamp(28px,4vw,48px)] font-bold tracking-tight text-stone-900 leading-[1.12] mb-8 font-playfair">
            Operations should be structured, not stressful.
          </h2>
          <p className="text-[17px] text-stone-500 leading-relaxed max-w-[580px] mx-auto mb-5">
            Your team delivers exceptional hospitality every day. They deserve
            tools that match. SelfServe was built from the ground up for
            independent hotels — not retrofitted enterprise software stripped
            down to fit.
          </p>
          <p className="text-[17px] text-stone-500 leading-relaxed max-w-[580px] mx-auto">
            Real operators. Real properties. Real problems, solved.
          </p>
        </div>
      </section>

      <div className="h-px bg-stone-200/80" />

      {/* ── FINAL CTA ── */}
      <section className="py-24 md:py-28 bg-stone-950 px-6 relative overflow-hidden">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

        <div className="relative max-w-[700px] mx-auto text-center">
          <h2 className="text-[clamp(30px,4.2vw,52px)] font-bold tracking-tight text-[#F5F0EA] leading-[1.12] mb-4 font-playfair">
            Ready to run a tighter ship?
          </h2>
          <p className="text-[17px] text-stone-500 leading-relaxed max-w-[480px] mx-auto mb-10">
            See what SelfServe looks like for your property. No commitment, no
            pressure — just a conversation.
          </p>
          <div className="flex justify-center flex-wrap gap-3">
            <SignInButton>
              <button className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-[10px] transition-all shadow-lg shadow-primary/25 flex items-center gap-2">
                Get Started <ArrowRight className="size-4" />
              </button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-stone-950 border-t border-stone-800/60 py-8 px-6">
        <div className="max-w-[1120px] mx-auto flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-[7px] bg-primary flex items-center justify-center">
              <Octagon
                className="size-[13px] text-white"
                fill="white"
                strokeWidth={1.5}
              />
            </div>
            <span className="text-[15px] font-semibold text-stone-500 font-playfair">
              SelfServe
            </span>
          </div>
          <span className="text-xs text-stone-600">
            © 2026 SelfServe. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  )
}