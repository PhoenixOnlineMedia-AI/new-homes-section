import { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Building2, 
  Users, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Home,
  Hammer,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { APP_NAME, CONTACT_INFO } from '@/lib/constants'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${APP_NAME}. Contact us for home buying questions, builder partnerships, advertising opportunities, or general inquiries.`,
  openGraph: {
    title: `Contact Us | ${APP_NAME}`,
    description: `Get in touch with ${APP_NAME} for all your new home needs.`,
  },
}

const contactReasons = [
  {
    icon: Home,
    title: 'Home Buyer',
    description: 'Researching builders? Start with verified profiles and local markets.',
    cta: 'Browse Builders',
    href: '/builders',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: Building2,
    title: 'Builder Partnership',
    description: 'Want to feature your company profile and markets? Let\'s discuss partnership opportunities.',
    cta: 'Partner With Us',
    href: '#builder-inquiry',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: TrendingUp,
    title: 'Advertising',
    description: 'Promote your brand to thousands of qualified home buyers.',
    cta: 'Learn More',
    href: '#advertising',
    color: 'bg-purple-100 text-purple-700',
  },
]

const faqs = [
  {
    question: 'How do I search for builders?',
    answer: 'Use the builder directory to browse by builder name, state, or city market. Community and home inventory will be added after launch.',
  },
  {
    question: 'When will community and home listings be available?',
    answer: 'We are launching first with verified builder profiles. Community and home inventory is planned for Q3 2026.',
  },
  {
    question: 'How can my company partner with New Homes Section?',
    answer: 'We offer various partnership opportunities for builders, developers, and real estate professionals. Fill out our builder inquiry form below and our team will reach out to discuss options.',
  },
  {
    question: 'Is there a cost to use New Homes Section?',
    answer: 'No, our platform is completely free for home buyers. We believe everyone should have access to comprehensive information when searching for their dream home.',
  },
]

export default function ContactPage() {
  return (
    <>
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: `Contact ${APP_NAME}`,
        description: `Contact ${APP_NAME} for home buying assistance, builder partnerships, or general inquiries.`,
        url: `https://${CONTACT_INFO.email.split('@')[1]}/contact`,
        mainEntity: {
          '@type': 'Organization',
          name: APP_NAME,
          email: CONTACT_INFO.email,
          telephone: CONTACT_INFO.phone,
        }
      }} />

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">
                We&apos;re Here to Help
              </Badge>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Get in Touch
              </h1>
              <p className="text-lg text-slate-300">
                Whether you&apos;re searching for your dream home or looking to partner with us, 
                we&apos;d love to hear from you.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className="py-12 -mt-8">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-6">
              {contactReasons.map((reason) => (
                <Card key={reason.title} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl ${reason.color} flex items-center justify-center mb-4`}>
                      <reason.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{reason.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">{reason.description}</p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <Link href={reason.href}>
                        {reason.cta} <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we&apos;ll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContactForm />
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Sidebar */}
              <div className="space-y-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <a 
                      href={`mailto:${CONTACT_INFO.email}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="text-slate-900 font-medium group-hover:text-blue-600 transition-colors">
                          {CONTACT_INFO.email}
                        </p>
                      </div>
                    </a>

                    <a 
                      href={`tel:${CONTACT_INFO.phone.replace(/-/g, '')}`}
                      className="flex items-start gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-200 transition-colors">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Phone</p>
                        <p className="text-slate-900 font-medium group-hover:text-emerald-600 transition-colors">
                          {CONTACT_INFO.phone}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Business Hours</p>
                        <p className="text-slate-900 font-medium">Mon - Fri: 9AM - 6PM EST</p>
                        <p className="text-slate-600 text-sm">Sat - Sun: 10AM - 4PM EST</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Response Promise */}
                <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="h-8 w-8 text-emerald-200" />
                      <h3 className="font-semibold text-lg">Fast Response</h3>
                    </div>
                    <p className="text-emerald-100 text-sm">
                      We aim to respond to all inquiries within 24 hours during business days.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Builder Partnership Section */}
        <section id="builder-inquiry" className="py-16 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <Badge className="mb-4 bg-emerald-600 hover:bg-emerald-700">
                  For Builders & Developers
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Partner With {APP_NAME}
                </h2>
                <p className="text-slate-300 text-lg">
                  Join builders showcasing their company profile and local markets to
                  qualified home buyers every month.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-emerald-400" />
                    Why Partner With Us?
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'Showcase your builder profile and local markets',
                      'Reach pre-qualified home buyers actively searching',
                      'Detailed analytics on builder profile performance',
                      'SEO-optimized pages for better visibility',
                      'Direct lead generation to your sales team',
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Users className="h-6 w-6 text-emerald-400" />
                    Who We Work With
                  </h3>
                  <ul className="space-y-3">
                    {[
                      'National home builders',
                      'Regional builders',
                      'Custom home builders',
                      'Community developers',
                      'Real estate investment trusts',
                    ].map((partner) => (
                      <li key={partner} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {partner}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">
                    <Hammer className="h-6 w-6 inline mr-2 text-emerald-600" />
                    Builder Partnership Inquiry
                  </CardTitle>
                  <CardDescription>
                    Tell us about your company and markets. Our partnership team will contact you shortly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Builder inquiry form would go here - simplified for now */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                      <Link href="mailto:partnerships@newhomessection.com?subject=Builder Partnership Inquiry">
                        <Mail className="h-5 w-5 mr-2" />
                        Email Partnerships Team
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="tel:1-800-NEW-HOME">
                        <Phone className="h-5 w-5 mr-2" />
                        Call Us Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  FAQ
                </Badge>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-slate-600">
                  Quick answers to common questions. Can&apos;t find what you&apos;re looking for? 
                  Contact us directly.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} className="border border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base font-semibold text-slate-900">
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-emerald-600">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Find Your Builder?
              </h2>
              <p className="text-emerald-100 mb-8 text-lg">
                Browse verified builder profiles and local market pages across the country.
              </p>
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 shadow-lg" asChild>
                <Link href="/builders">Browse Builders</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
