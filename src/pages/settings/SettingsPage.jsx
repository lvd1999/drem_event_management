import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useSettings, useUpdateSettings, useUploadLogo, useRemoveLogo, SETTINGS_DEFAULTS } from '@/hooks/useSettings'
import PageHeader from '@/components/common/PageHeader'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Upload, X } from 'lucide-react'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const update = useUpdateSettings()
  const uploadLogo = useUploadLogo()
  const removeLogo = useRemoveLogo()
  const fileInputRef = useRef(null)

  const { register, handleSubmit, reset } = useForm({ defaultValues: SETTINGS_DEFAULTS })

  useEffect(() => {
    if (settings) reset(settings)
  }, [settings, reset])

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) uploadLogo.mutate(file)
    e.target.value = ''
  }

  if (isLoading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Customise quotation branding and text." />

      {/* Logo — outside main form, uploads immediately on file select */}
      <Card className="mb-6">
        <CardContent className="pt-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Company Logo</p>
          <Separator />
          <div className="flex items-center gap-5">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Company logo"
                className="h-16 w-auto object-contain rounded border border-border bg-gray-50 p-1"
              />
            ) : (
              <div className="h-16 w-28 rounded border border-dashed border-border bg-gray-50 flex items-center justify-center text-xs text-muted-foreground">
                No logo
              </div>
            )}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadLogo.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} className="mr-1.5" />
                {uploadLogo.isPending ? 'Uploading…' : settings?.logoUrl ? 'Change Logo' : 'Upload Logo'}
              </Button>
              {settings?.logoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={removeLogo.isPending}
                  onClick={() => removeLogo.mutate()}
                >
                  <X size={14} className="mr-1.5" />
                  {removeLogo.isPending ? 'Removing…' : 'Remove Logo'}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">PNG or JPG recommended. Max display height is 64px on the quotation.</p>
        </CardContent>
      </Card>

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
