'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  Building, 
  Settings, 
  MessageCircle, 
  Info,
  ShieldCheck,
  Bot,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { 
  getAllSettings, 
  updateSetting, 
  type Setting 
} from '@/app/actions/settings'

type SettingField = {
  key: string
  label: string
  type: 'text' | 'password' | 'textarea' | 'toggle'
  placeholder?: string
}

type SectionConfig = {
  title: string
  description: string
  icon: typeof Building
  iconColor?: string
  category: string
  fields: SettingField[]
}

const sections: SectionConfig[] = [
  {
    title: 'Workspace',
    description: 'Organizasyon profilinizi ve genel ayarlarınızı yönetin.',
    icon: Building,
    category: 'workspace',
    fields: [
      { key: 'organization_name', label: 'Organizasyon Adı', type: 'text', placeholder: 'WeCaHan' },
      { key: 'language', label: 'Dil', type: 'text', placeholder: 'tr' },
      { key: 'timezone', label: 'Zaman Dilimi', type: 'text', placeholder: 'Europe/Istanbul' },
    ]
  },
  {
    title: 'WhatsApp Connection',
    description: 'Cloud API kimlik bilgilerini ve webhook ayarlarını yapılandırın.',
    icon: MessageCircle,
    iconColor: 'text-emerald-500',
    category: 'whatsapp',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'Meta iş hesabı numarası' },
      { key: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Meta tarafından sağlanan token' },
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://...' },
      { key: 'api_version', label: 'API Version', type: 'text', placeholder: 'v20.0' },
    ]
  },
  {
    title: 'Automation & AI',
    description: 'n8n entegrasyonu ve AI model parametrelerini kontrol edin.',
    icon: Bot,
    iconColor: 'text-violet-500',
    category: 'automation',
    fields: [
      { key: 'ai_mode_rules', label: 'AI Kuralları (System Prompt)', type: 'textarea', placeholder: 'AI asistanın nasıl davranacağını tanımlayın...' },
      { key: 'n8n_webhook_secret', label: 'n8n Webhook Secret', type: 'password', placeholder: 'Webhook doğrulama anahtarı' },
      { key: 'auto_reply_enabled', label: 'Otomatik Yanıt', type: 'toggle' },
    ]
  },
  {
    title: 'Security',
    description: 'Erişim logları, denetim izleri ve güvenlik izleme.',
    icon: ShieldCheck,
    iconColor: 'text-primary',
    category: 'security',
    fields: []
  }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  const fetchSettings = useCallback(async () => {
    const data = await getAllSettings()
    const map: Record<string, string> = {}
    data.forEach((s: Setting) => {
      map[`${s.category}.${s.key}`] = s.value || ''
    })
    setSettings(map)
    setFormValues(map)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async (category: string, key: string) => {
    const compositeKey = `${category}.${key}`
    setSaving(compositeKey)
    const result = await updateSetting(category, key, formValues[compositeKey] || '')
    setSaving(null)
    if (result.success) {
      setSettings(prev => ({ ...prev, [compositeKey]: formValues[compositeKey] || '' }))
      setSaved(compositeKey)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  const handleSaveSection = async (section: SectionConfig) => {
    setSaving(section.category)
    for (const field of section.fields) {
      if (field.type === 'toggle') continue
      const compositeKey = `${section.category}.${field.key}`
      if (formValues[compositeKey] !== settings[compositeKey]) {
        await updateSetting(section.category, field.key, formValues[compositeKey] || '')
      }
    }
    await fetchSettings()
    setSaving(null)
    setSaved(section.category)
    setTimeout(() => setSaved(null), 2000)
    setEditingSection(null)
  }

  const handleToggle = async (category: string, key: string) => {
    const compositeKey = `${category}.${key}`
    const current = settings[compositeKey]
    const newValue = current === 'true' ? 'false' : 'true'
    setSaving(compositeKey)
    const result = await updateSetting(category, key, newValue)
    if (result.success) {
      setSettings(prev => ({ ...prev, [compositeKey]: newValue }))
      setFormValues(prev => ({ ...prev, [compositeKey]: newValue }))
    }
    setSaving(null)
  }

  const togglePasswordVisibility = (key: string) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const hasChanges = (section: SectionConfig) => {
    return section.fields.some(f => {
      if (f.type === 'toggle') return false
      const ck = `${section.category}.${f.key}`
      return formValues[ck] !== settings[ck]
    })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium animate-pulse italic">Ayarlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-10 px-6">
      <div className="flex flex-col space-y-3 mb-12">
        <h1 className="text-4xl font-black tracking-tight flex items-center">
          <Settings className="h-8 w-8 mr-4 text-muted-foreground" />
          Ayarlar
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          WeCaHan Inbox panelinin tüm yapılandırmasını buradan yönetin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section) => {
          const isEditing = editingSection === section.category
          const isSaving = saving === section.category
          const isSaved = saved === section.category

          return (
            <div 
              key={section.category} 
              className={cn(
                "group relative rounded-3xl border bg-card p-8 transition-all",
                isEditing 
                  ? "border-primary/40 shadow-2xl shadow-primary/10 md:col-span-2" 
                  : "hover:bg-muted/10 hover:shadow-2xl hover:shadow-black/20 hover:border-primary/20"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl bg-muted/20 border flex items-center justify-center transition-all",
                    isEditing ? "scale-110" : "group-hover:scale-110",
                    section.iconColor || "text-foreground"
                  )}>
                    <section.icon className={cn("h-7 w-7", section.iconColor || "text-foreground")} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">{section.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed">{section.description}</p>
                  </div>
                </div>

                {section.fields.length > 0 && (
                  <div className="flex items-center gap-2">
                    {isSaved && (
                      <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold animate-in fade-in">
                        <CheckCircle2 className="h-4 w-4" /> Kaydedildi
                      </span>
                    )}
                    {isEditing ? (
                      <button
                        onClick={() => {
                          setEditingSection(null)
                          setFormValues(settings)
                        }}
                        className="p-2 rounded-xl hover:bg-muted transition-all text-muted-foreground"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingSection(section.category)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        Düzenle
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-6">
                {section.fields.length === 0 ? (
                  <div className="text-center py-8 opacity-40">
                    <ShieldCheck className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm font-bold">Yakında aktif olacak</p>
                  </div>
                ) : (
                  section.fields.map((field) => {
                    const compositeKey = `${section.category}.${field.key}`
                    const value = formValues[compositeKey] || ''

                    if (field.type === 'toggle') {
                      const isOn = settings[compositeKey] === 'true'
                      const isToggleSaving = saving === compositeKey
                      return (
                        <div key={field.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
                          <span className="text-sm font-bold">{field.label}</span>
                          <button
                            onClick={() => handleToggle(section.category, field.key)}
                            disabled={isToggleSaving}
                            className={cn(
                              "relative w-12 h-7 rounded-full transition-all duration-300",
                              isOn ? "bg-primary" : "bg-muted-foreground/30"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300",
                              isOn ? "left-[22px]" : "left-0.5"
                            )} />
                          </button>
                        </div>
                      )
                    }

                    if (!isEditing) {
                      return (
                        <div key={field.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/20 transition-all border border-transparent hover:border-border/40">
                          <span className="text-sm font-bold text-muted-foreground">{field.label}</span>
                          <span className="text-sm text-foreground/70 font-mono truncate max-w-[200px]">
                            {field.type === 'password' 
                              ? (value ? '••••••••' : '—') 
                              : (value || '—')}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <div key={field.key} className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{field.label}</label>
                        {field.type === 'textarea' ? (
                          <textarea
                            value={value}
                            onChange={(e) => setFormValues(prev => ({ ...prev, [compositeKey]: e.target.value }))}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                          />
                        ) : (
                          <div className="relative">
                            <input
                              type={field.type === 'password' && !visiblePasswords.has(compositeKey) ? 'password' : 'text'}
                              value={value}
                              onChange={(e) => setFormValues(prev => ({ ...prev, [compositeKey]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full rounded-xl border bg-muted/30 px-4 py-3 text-sm font-mono focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all pr-12"
                            />
                            {field.type === 'password' && (
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(compositeKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {visiblePasswords.has(compositeKey) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {isEditing && hasChanges(section) && (
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => handleSaveSection(section)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              )}

              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <section.icon className="h-24 w-24" />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-center pt-16 mt-16 border-t border-muted/20">
        <div className="max-w-2xl text-center space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Info className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sistem Durumu: Aktif</span>
          </div>
          <p className="text-xs text-muted-foreground italic max-w-sm mx-auto opacity-60">
            Ayarlar veritabanında güvenli bir şekilde saklanmaktadır. Değişiklikler anında uygulanır.
          </p>
        </div>
      </div>
    </div>
  )
}
