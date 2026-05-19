import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarCheck, CheckCircle2, Home, PackageCheck, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Moving Checklist',
  description: `A step-by-step moving checklist from ${APP_NAME} for new construction buyers preparing for closing and move-in day.`,
  openGraph: {
    title: `Moving Checklist | ${APP_NAME}`,
    description: 'Stay organized from contract to closing with a practical moving checklist for new home buyers.',
  },
}

const timeline = [
  {
    title: '8 weeks before closing',
    icon: CalendarCheck,
    tasks: [
      'Confirm the builder timeline and expected closing window.',
      'Compare moving companies and request written estimates.',
      'Create a room-by-room list of what you will move, sell, donate, or discard.',
      'Collect lender, insurance, HOA, utility, and warranty contacts in one place.',
    ],
  },
  {
    title: '4 weeks before closing',
    icon: PackageCheck,
    tasks: [
      'Start packing low-use items and label boxes by room.',
      'Schedule utility transfers for electric, gas, water, internet, and trash service.',
      'Order appliances, window coverings, or furniture with long lead times.',
      'Book time off for walkthroughs, signing, and move-in day.',
    ],
  },
  {
    title: 'Final week',
    icon: Home,
    tasks: [
      'Complete your final walkthrough and document open items.',
      'Confirm wire instructions directly with the title company before sending funds.',
      'Pack an essentials box with chargers, toiletries, medication, tools, and paperwork.',
      'Verify keys, garage remotes, mailbox access, gate codes, and warranty instructions.',
    ],
  },
  {
    title: 'Move-in day',
    icon: Truck,
    tasks: [
      'Protect floors, doors, and corners before movers begin unloading.',
      'Check boxes and furniture against your inventory before signing mover paperwork.',
      'Test smoke detectors, locks, appliances, HVAC, water heater, and irrigation.',
      'Save builder service contacts and submit warranty items promptly.',
    ],
  },
]

export default function MovingChecklistPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-900 py-16 text-white md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">Buyer Resource</Badge>
            <h1 className="text-3xl font-bold md:text-5xl">Moving Checklist</h1>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              Keep your move organized from the first packing box to the first night in your new home.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-re-blue-900 hover:bg-slate-100">
                <Link href="/resources/home-buying-guide">Read Buying Guide</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-re-blue-800 hover:border-white">
                <Link href="/contact">Ask a Question</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {timeline.map((group) => (
              <Card key={group.title} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-re-blue-100 text-re-blue-700">
                      <group.icon className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">{group.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {group.tasks.map((task) => (
                      <div key={task} className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
                        <p className="text-sm leading-relaxed text-slate-700">{task}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-18">
        <div className="container mx-auto px-4">
          <div className="rounded-lg bg-emerald-600 p-8 text-white md:p-10">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold md:text-3xl">Before you schedule movers</h2>
              <p className="mt-4 leading-relaxed text-emerald-50">
                Confirm your closing date, certificate of occupancy, builder access rules, elevator or gate reservations, and insurance coverage before locking in your moving day.
              </p>
              <Button asChild className="mt-6 bg-white text-re-blue-900 hover:bg-slate-100">
                <Link href="/builders">
                  Find Builders <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
