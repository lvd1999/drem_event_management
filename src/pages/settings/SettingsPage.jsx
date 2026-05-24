import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSettings, useUpdateSettings, SETTINGS_DEFAULTS } from '@/hooks/useSettings'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const update = useUpdateSettings()

  const { register, handleSubmit, reset } = useForm({ defaultValues: SETTINGS_DEFAULTS })

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Customise quotation branding and text." />

      <form onSubmit={handleSubmit(data => update.mutate(data))} className="space-y-6">

        {/* Company Info */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Company Info</p>
            <Separator />
            <div className="space-y-1.5">
              <Label>Company Name</Label>
              <Input {...register('companyName')} placeholder={SETTINGS_DEFAULTS.companyName} />
            </div>
            <div className="space-y-1.5">
              <Label>Tagline / Subtitle</Label>
              <Input {...register('tagline')} placeholder={SETTINGS_DEFAULTS.tagline} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register('email')} placeholder={SETTINGS_DEFAULTS.email} />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input {...register('phone')} placeholder="e.g. +60 12-345 6789" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Company Registration No.</Label>
              <Input {...register('companyRegNo')} placeholder="e.g. 1234567-A" />
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Payment Details</p>
            <Separator />
            <p className="text-xs text-muted-foreground">Printed on quotations below the Balance Due section so clients know where to transfer.</p>
            <div className="space-y-1.5">
              <Label>Bank Name</Label>
              <Input {...register('bankName')} placeholder="e.g. Maybank" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Account Number</Label>
                <Input {...register('bankAccount')} placeholder="e.g. 1234 5678 9012" />
              </div>
              <div className="space-y-1.5">
                <Label>Account Holder Name</Label>
                <Input {...register('bankHolder')} placeholder="e.g. Dokoh Ratna Sdn Bhd" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quotation Document */}
        <Card>
          <CardContent className="pt-5 space-y-4">
            <p className="text-sm font-semibold text-foreground">Quotation Document</p>
            <Separator />
            <div className="space-y-1.5">
              <Label>Document Title</Label>
              <Input {...register('documentTitle')} placeholder={SETTINGS_DEFAULTS.documentTitle} />
              <p className="text-xs text-muted-foreground">Shown as the heading on the printed quotation (e.g. QUOTATION, SEBUTHARGA).</p>
            </div>
            <div className="space-y-1.5">
              <Label>Terms &amp; Conditions</Label>
              <Textarea
                rows={6}
                {...register('termsText')}
                placeholder={SETTINGS_DEFAULTS.termsText}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">One term per line. Each line is printed as a separate bullet point.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Footer Message</Label>
              <Textarea
                rows={2}
                {...register('footerText')}
                placeholder={SETTINGS_DEFAULTS.footerText}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
