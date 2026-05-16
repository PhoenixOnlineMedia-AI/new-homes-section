import { HeroSearch } from '@/components/search/HeroSearch'
import { FeaturedBuilders } from '@/components/home/FeaturedBuilders'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { POPULAR_STATES, APP_NAME } from '@/lib/constants'
import { LAUNCH_BANNER } from '@/lib/launch'
import { 
  MapPin, 
  Building2, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

// Features for the why choose us section
const features = [
  {
    icon: Building2,
    title: 'Builder-First Directory',
    description: 'Browse verified national, regional, and local builders by the markets they serve.',
  },
  {
    icon: Shield,
    title: 'Verified Builders',
    description: 'All builders are vetted and verified for quality and reliability.',
  },
  {
    icon: TrendingUp,
    title: 'Market Visibility',
    description: 'See where builders are active before community and home inventory goes live.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Verified builder profiles include direct links to their local markets.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Search Section */}
      <HeroSearch />

      {/* Featured Builders Section */}
      <section className="border-y border-emerald-200 bg-emerald-50 py-3">
        <div className="container mx-auto px-4 text-center text-sm font-medium text-emerald-900">
          {LAUNCH_BANNER}
        </div>
      </section>

      {/* Featured Builders Section */}
      <FeaturedBuilders limit={4} showViewAll={true} />

      {/* Why Choose Us Section */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Why Choose {APP_NAME}?
            </h2>
            <p className="text-slate-600">
              We make it easier to find trusted builders by location now, with
              community and home inventory rolling out next.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-slate-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-re-blue-100 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-re-blue-700" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State Section */}
      <section id="states" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Browse Builders by State
            </h2>
            <p className="text-slate-600">
              Start with a state directory, then drill into city-level builder markets.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_STATES.map((state) => (
              <Link
                key={state.code}
                href={`/builders/${state.slug}`}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-re-blue-500 hover:bg-re-blue-50 transition-all group"
              >
                <span className="font-medium text-slate-700 group-hover:text-emerald-700">
                  {state.name}
                </span>
                <span className="text-sm text-slate-400 group-hover:text-emerald-600">
                  {state.code}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link href="/markets">View All States</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-slate-400">
              Find the right builder in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse Builders',
                description: 'Start with verified builder profiles and compare national, regional, and local options.',
              },
              {
                step: '02',
                title: 'View Their Markets',
                description: 'See the states and cities where each builder is active.',
              },
              {
                step: '03',
                title: 'Contact Builder',
                description: 'Visit the builder online or reach out through their profile when you are ready.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <span className="text-5xl font-bold text-emerald-500/30">{item.step}</span>
                <h3 className="text-xl font-semibold mt-4 mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Find Your Builder?
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Explore verified builder profiles and local markets on {APP_NAME}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-re-blue-900 hover:bg-slate-100 shadow-lg" asChild>
                <Link href="/builders">Browse Builders</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-re-blue-800 hover:border-white" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-emerald-100 text-sm">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Free to use
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> No registration required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Updated daily
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
