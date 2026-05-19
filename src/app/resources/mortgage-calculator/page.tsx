import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Banknote, FileText, Percent } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MortgageCalculator } from '@/components/resources/MortgageCalculator'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Mortgage Calculator',
  description: `Estimate monthly mortgage payments for a new construction home with ${APP_NAME}'s mortgage calculator.`,
  openGraph: {
    title: `Mortgage Calculator | ${APP_NAME}`,
    description: 'Estimate principal, interest, property taxes, insurance, and HOA dues for a new home.',
  },
}

const planningNotes = [
  {
    icon: Percent,
    title: 'Rates change daily',
    description: 'Use this calculator for early planning, then confirm rates, APR, points, and lock terms with your lender.',
  },
  {
    icon: Banknote,
    title: 'Budget beyond payment',
    description: 'Include closing costs, deposits, inspections, design options, appliances, window coverings, and moving expenses.',
  },
  {
    icon: FileText,
    title: 'Ask about incentives',
    description: 'Builders may offer lender credits, rate buydowns, or design center incentives that change your final numbers.',
  },
]

export default function MortgageCalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 py-16 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">Buyer Resource</Badge>
            <h1 className="text-3xl font-bold md:text-5xl">Mortgage Calculator</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Estimate your monthly payment before you compare builders, tour models, or reserve a homesite.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <MortgageCalculator />
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Use the estimate wisely</h2>
            <p className="mt-3 text-slate-600">
              A payment estimate is one part of the buying picture. Pair it with builder timelines, available incentives, and your cash-to-close plan.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {planningNotes.map((note) => (
              <Card key={note.title} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <note.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">{note.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{note.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/builders">
                Browse Builders <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/resources/home-buying-guide">Read Buying Guide</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
