'use client'

import { useAppointments } from '@/hooks/useAppointments'
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  User, 
  ChevronRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export default function AppointmentsPage() {
  const { appointments, loading } = useAppointments()

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'requested': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'confirmed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'attended': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'no_show': return 'bg-orange-500/10 text-orange-600 border-orange-500/20'
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground font-medium animate-pulse italic">Randevular yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden gap-6 p-6 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Appointments</h1>
          <p className="text-muted-foreground text-sm font-medium">Aktif randevu taleplerini ve müşteri notlarını buradan yönetin.</p>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm shadow-sm backdrop-blur-md">
           {appointments.length} Toplam Randevu
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed border-muted rounded-[2.5rem] bg-muted/5">
            <div className="bg-muted w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <ClipboardList className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Henüz randevu yok</h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm font-medium">
              AI tarafından oluşturulan randevu talepleri burada görünecektir.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 pb-8">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-border/60 bg-card hover:border-primary/40 hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.1)] transition-all duration-500 hover:-translate-y-1"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />

                <div className="p-7 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-lg text-foreground truncate">
                          {appointment.profile_name || 'İsimsiz Müşteri'}
                        </h3>
                        <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">
                          <Phone className="h-3 w-3 mr-1.5 text-primary/60" />
                          {appointment.phone_number}
                        </div>
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm shrink-0 whitespace-nowrap",
                      getStatusStyles(appointment.appointment_status)
                    )}>
                      {appointment.appointment_status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-4">
                    <div className="relative overflow-hidden p-4 rounded-2xl bg-muted/30 border border-border/40 group-hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                         <Calendar className="h-4 w-4 text-primary" />
                         <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Randevu Zamanı</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {appointment.appointment_requested_at 
                          ? formatDistanceToNow(new Date(appointment.appointment_requested_at), { addSuffix: true })
                          : 'Tarih belirtilmedi'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-primary/[0.02] border border-primary/5 min-h-[80px]">
                      <div className="flex items-center gap-3 mb-2">
                         <AlertCircle className="h-4 w-4 text-primary/60" />
                         <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Notlar</span>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground/80 leading-relaxed italic line-clamp-3">
                        {appointment.appointment_notes || 'Henüz bir not eklenmemiş.'}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <Link 
                    href={`/inbox?id=${appointment.id}`}
                    className="flex w-full group/link"
                  >
                    <div className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-primary-foreground font-black text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                      <MessageSquare className="h-5 w-5" />
                      KONUŞMAYI AÇ
                      <ChevronRight className="h-5 w-5 transition-transform group-hover/link:translate-x-1" />
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(var(--primary-rgb), 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(var(--primary-rgb), 0.2);
        }
      `}</style>
    </div>
  )
}
