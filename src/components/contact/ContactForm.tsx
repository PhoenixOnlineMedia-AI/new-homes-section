'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Home, 
  Building2, 
  TrendingUp, 
  HelpCircle, 
  Send, 
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MessageSquare
} from 'lucide-react'

const inquiryTypes = [
  { value: 'home-buyer', label: 'Home Buyer Question', icon: Home },
  { value: 'builder-partnership', label: 'Builder Partnership', icon: Building2 },
  { value: 'advertising', label: 'Advertising Inquiry', icon: TrendingUp },
  { value: 'general', label: 'General Question', icon: HelpCircle },
]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission - in production, this would send to your backend
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSubmitted) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Message Sent Successfully!
          </h3>
          <p className="text-slate-600 mb-6">
            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsSubmitted(false)
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                inquiryType: '',
                message: '',
              })
            }}
          >
            Send Another Message
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400" />
            First Name *
          </label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium text-slate-700">
            Last Name *
          </label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            required
            className="h-11"
          />
        </div>
      </div>

      {/* Contact Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            Email Address *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400" />
            Phone Number
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            className="h-11"
          />
        </div>
      </div>

      {/* Inquiry Type */}
      <div className="space-y-2">
        <label htmlFor="inquiryType" className="text-sm font-medium text-slate-700">
          How Can We Help You? *
        </label>
        <Select
          value={formData.inquiryType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, inquiryType: value }))}
          required
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {inquiryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4" />
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-400" />
          Your Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us how we can help you..."
          required
          rows={5}
          className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="h-5 w-5 mr-2" />
            Send Message
          </>
        )}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>
        {' '}and{' '}
        <a href="/terms" className="text-emerald-600 hover:underline">Terms of Service</a>.
      </p>
    </form>
  )
}
