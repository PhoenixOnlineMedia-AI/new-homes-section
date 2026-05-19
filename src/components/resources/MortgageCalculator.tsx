'use client'

import { useMemo, useState } from 'react'
import { Calculator } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

function toNumber(value: string) {
  return Number(value.replace(/,/g, '')) || 0
}

export function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState('450000')
  const [downPayment, setDownPayment] = useState('90000')
  const [interestRate, setInterestRate] = useState('6.75')
  const [loanTerm, setLoanTerm] = useState('30')
  const [propertyTax, setPropertyTax] = useState('5400')
  const [insurance, setInsurance] = useState('1800')
  const [hoa, setHoa] = useState('100')

  const totals = useMemo(() => {
    const price = toNumber(homePrice)
    const down = toNumber(downPayment)
    const principal = Math.max(price - down, 0)
    const monthlyRate = (Number(interestRate) || 0) / 100 / 12
    const payments = (Number(loanTerm) || 30) * 12
    const monthlyPrincipalInterest = monthlyRate > 0
      ? principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1)
      : principal / payments
    const monthlyTax = toNumber(propertyTax) / 12
    const monthlyInsurance = toNumber(insurance) / 12
    const monthlyHoa = toNumber(hoa)
    const monthlyTotal = monthlyPrincipalInterest + monthlyTax + monthlyInsurance + monthlyHoa

    return {
      principal,
      monthlyPrincipalInterest,
      monthlyTax,
      monthlyInsurance,
      monthlyHoa,
      monthlyTotal,
      cashToCloseBase: down,
    }
  }, [downPayment, hoa, homePrice, insurance, interestRate, loanTerm, propertyTax])

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-2xl">Monthly Payment Estimate</CardTitle>
            <p className="text-sm text-slate-500">Principal, interest, taxes, insurance, and HOA</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="home-price">Home price</Label>
              <Input id="home-price" inputMode="numeric" value={homePrice} onChange={(event) => setHomePrice(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="down-payment">Down payment</Label>
              <Input id="down-payment" inputMode="numeric" value={downPayment} onChange={(event) => setDownPayment(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest-rate">Interest rate</Label>
              <Input id="interest-rate" inputMode="decimal" value={interestRate} onChange={(event) => setInterestRate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan-term">Loan term</Label>
              <Input id="loan-term" inputMode="numeric" value={loanTerm} onChange={(event) => setLoanTerm(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="property-tax">Annual property tax</Label>
              <Input id="property-tax" inputMode="numeric" value={propertyTax} onChange={(event) => setPropertyTax(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="insurance">Annual insurance</Label>
              <Input id="insurance" inputMode="numeric" value={insurance} onChange={(event) => setInsurance(event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="hoa">Monthly HOA</Label>
              <Input id="hoa" inputMode="numeric" value={hoa} onChange={(event) => setHoa(event.target.value)} />
            </div>
          </div>

          <div className="rounded-lg bg-slate-900 p-6 text-white">
            <p className="text-sm font-medium text-emerald-300">Estimated monthly payment</p>
            <p className="mt-2 text-4xl font-bold">{formatCurrency(totals.monthlyTotal)}</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span className="text-slate-300">Loan amount</span>
                <span className="font-semibold">{formatCurrency(totals.principal)}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span className="text-slate-300">Principal and interest</span>
                <span className="font-semibold">{formatCurrency(totals.monthlyPrincipalInterest)}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span className="text-slate-300">Taxes</span>
                <span className="font-semibold">{formatCurrency(totals.monthlyTax)}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/10 pb-3">
                <span className="text-slate-300">Insurance</span>
                <span className="font-semibold">{formatCurrency(totals.monthlyInsurance)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-300">HOA</span>
                <span className="font-semibold">{formatCurrency(totals.monthlyHoa)}</span>
              </div>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-slate-400">
              This estimate is for planning only. It does not include mortgage insurance, closing costs, lender fees, builder incentives, or rate-lock details.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
