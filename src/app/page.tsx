import { HeroSearch } from '@/components/search/HeroSearch'
import { FeaturedBuilders } from '@/components/home/FeaturedBuilders'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { POPULAR_STATES, APP_NAME } from '@/lib/constants'
import { 
  MapPin, 
  Building2, 
  Home, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

// Features for the why choose us section
const features = [
  {
    icon: Home,
    title: 'Exclusive New Construction',
    description: 'Access thousands of new homes and communities not listed on other sites.',
  },
  {
    icon: Shield,
    title: 'Verified Builders',
    description: 'All builders are vetted and verified for quality and reliability.',
  },
  {
    icon: TrendingUp,
    title: 'Price Transparency',
    description: 'See actual prices, incentives, and availability in real-time.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'Compare floor plans, amenities, and neighborhoods all in one place.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Search Section */}
      <HeroSearch />

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
              We make finding your new home easier with the largest selection 
              of new construction homes and communities.
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
              Browse New Homes by State
            </h2>
            <p className="text-slate-600">
              Find new construction homes and communities in your desired location
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_STATES.map((state) => (
              <Link
                key={state.code}
                href={`/${state.slug}`}
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
              Your journey to a new home in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Search Communities',
                description: 'Browse thousands of new home communities by location, price, and amenities.',
              },
              {
                step: '02',
                title: 'Compare Homes',
                description: 'View floor plans, pricing, photos, and detailed community information.',
              },
              {
                step: '03',
                title: 'Connect with Builders',
                description: 'Schedule tours, request information, and start your home buying journey.',
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
              Ready to Find Your New Home?
            </h2>
            <p className="text-emerald-100 mb-8 text-lg">
              Join thousands of home buyers who found their perfect new construction home through {APP_NAME}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-re-blue-900 hover:bg-slate-100 shadow-lg" asChild>
                <Link href="/search">Start Your Search</Link>
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
