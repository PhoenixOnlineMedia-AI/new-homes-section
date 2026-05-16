import Link from 'next/link'
import { Home, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { APP_NAME, SOCIAL_LINKS, CONTACT_INFO, POPULAR_STATES } from '@/lib/constants'

const footerLinks = {
  browse: [
    { label: 'Builders by State', href: '/markets' },
    { label: 'Builders by City', href: '/markets' },
    { label: 'New Home Builders', href: '/builders' },
    { label: 'Contact a Builder', href: '/contact' },
  ],
  resources: [
    { label: 'Home Buying Guide', href: '/' },
    { label: 'Mortgage Calculator', href: '/' },
    { label: 'Moving Checklist', href: '/' },
    { label: 'Blog', href: '/' },
  ],
  company: [
    { label: 'About Us', href: '/' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/' },
    { label: 'Press', href: '/' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/' },
    { label: 'Terms of Service', href: '/' },
    { label: 'Cookie Policy', href: '/' },
    { label: 'Accessibility', href: '/' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-re-blue-950 to-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-re-emerald-500 to-re-emerald-600 text-white shadow-lg">
                <Home className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white group-hover:text-re-emerald-400 transition-colors">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs leading-relaxed">
              Browse verified homebuilder profiles by state and city. Community and home inventory is coming Q3 2026.
            </p>
            <div className="flex gap-3">
              <a 
                href={SOCIAL_LINKS.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-re-blue-600 hover:scale-110 transition-all border border-slate-700/50"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href={SOCIAL_LINKS.twitter} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-re-blue-400 hover:scale-110 transition-all border border-slate-700/50"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href={SOCIAL_LINKS.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:scale-110 transition-all border border-slate-700/50"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href={SOCIAL_LINKS.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/50 hover:bg-re-blue-700 hover:scale-110 transition-all border border-slate-700/50"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Browse Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Browse</h3>
            <ul className="space-y-3">
              {footerLinks.browse.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-slate-400 hover:text-re-emerald-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-re-emerald-400 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-slate-400 hover:text-re-emerald-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-re-emerald-400 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-slate-400 hover:text-re-emerald-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-re-emerald-400 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-sm text-slate-400 hover:text-re-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-re-blue-400" />
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${CONTACT_INFO.phone.replace(/-/g, '')}`}
                  className="text-sm text-slate-400 hover:text-re-emerald-400 transition-colors flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-re-blue-400" />
                  {CONTACT_INFO.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Popular States */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Popular States</h3>
          <div className="flex flex-wrap gap-2">
            {POPULAR_STATES.map((state) => (
              <Link
                key={state.code}
                href={`/builders/${state.slug}`}
                className="px-4 py-2 text-sm bg-slate-800/50 hover:bg-re-blue-800 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700/30 hover:border-re-blue-600/50"
              >
                {state.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-slate-500 hover:text-re-emerald-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
