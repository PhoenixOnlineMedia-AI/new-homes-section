import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardList, Home, MapPin, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Home Buying Guide',
  description: `A practical guide from ${APP_NAME} for comparing builders, understanding new construction timelines, and preparing to buy a new home.`,
  openGraph: {
    title: `Home Buying Guide | ${APP_NAME}`,
    description: 'Compare builders, communities, budgets, and next steps before buying a new construction home.',
  },
}

const steps = [
  {
    icon: MapPin,
    title: 'Choose your market',
    description: 'Start with the cities and neighborhoods that match your commute, schools, daily routines, and long-term plans.',
  },
  {
    icon: ShieldCheck,
    title: 'Compare builders',
    description: 'Review builder profiles, active markets, home styles, warranty programs, reputation, and communication style.',
  },
  {
    icon: ClipboardList,
    title: 'Understand the numbers',
    description: 'Estimate payment, taxes, insurance, HOA dues, closing costs, options, upgrades, and cash needed before contract.',
  },
  {
    icon: Home,
    title: 'Tour with purpose',
    description: 'Walk model homes with a checklist for layout, storage, natural light, included finishes, and lot premiums.',
  },
]

const questions = [
  'What is included in the base price, and which model features are upgrades?',
  'How are lot premiums, design center selections, and change orders handled?',
  'What deposits are required, and when do they become non-refundable?',
  'What warranty coverage is included after closing?',
  'How often will the builder update you during construction?',
  'Can you review the community rules, HOA dues, taxes, and estimated completion date?',
]

export default function HomeBuyingGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 py-16 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">Buyer Resource</Badge>
            <h1 className="text-3xl font-bold md:text-5xl">Home Buying Guide</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              A clear path for buying a new construction home, from choosing a market to comparing builders and preparing for closing.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-re-blue-900 hover:bg-slate-100">
                <Link href="/builders">Browse Builders</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-re-blue-800 hover:border-white">
                <Link href="/resources/mortgage-calculator">Estimate Payment</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <Card key={step.title} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-re-blue-100 text-re-blue-700">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">What to do before you sign</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              New construction contracts can move quickly. Before committing, slow the process down enough to verify budget, timing, included features, and who is responsible for each decision.
            </p>
            <Button asChild className="mt-6">
              <Link href="/resources/moving-checklist">
                Plan Your Move <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {questions.map((question) => (
              <div key={question} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                <p className="text-sm leading-relaxed text-slate-700">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
