'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CalendarPlus, BrainCircuit, CalendarCheck, Send, CheckCircle2 } from 'lucide-react'
import { FadeUp, ScaleIn } from '@/components/marketing/motion-wrappers'

const workflowSteps = [
  {
    icon: CalendarPlus,
    title: 'Hasta Randevu Oluşturur',
    description: 'Telefon, web veya mesaj üzerinden gelen tüm talepler tek havuzda toplanır. Klinik ekibi manuel girişle uğraşmaz.',
    color: 'from-[#2563EB] to-cyan-400'
  },
  {
    icon: BrainCircuit,
    title: 'AI Boşlukları Analiz Eder',
    description: 'Yapay zeka asistanı; iptal edilen, boş kalan saatleri tespit edip, bekleyen hastalar için öneriler sunar.',
    color: 'from-cyan-400 to-[#06B6D4]'
  },
  {
    icon: CalendarCheck,
    title: 'Takvim Optimize Edilir',
    description: 'Onaylanan randevular otomatik olarak doktorun ve sekreterin takvimine işlenir, çakışmalar engellenir.',
    color: 'from-[#06B6D4] to-teal-400'
  },
  {
    icon: Send,
    title: 'Otomatik Bildirimler',
    description: 'Randevu öncesi hastaya SMS veya Email ile otomatik hatırlatma yapılarak "gelmeme" oranları (no-show) %80 azaltılır.',
    color: 'from-teal-400 to-[#2563EB]'
  }
]

export function WorkflowSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })
  
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
    <section id="how-it-works" className="bg-white py-24 md:py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        <FadeUp className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block rounded-full bg-[#06B6D4]/10 px-4 py-1.5 mb-6 text-sm font-bold text-[#0891B2]">
            İş Akışı Optimizasyonu
          </div>
          <h2 className="font-heading text-3xl font-black md:text-5xl text-[#0B1020]">
            Akıllı Bir Süreç.
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Karmakarışık randevu ve onay süreçlerini, yapay zeka destekli akıcı bir iş akışına dönüştürün.
          </p>
        </FadeUp>

        <div ref={containerRef} className="relative max-w-4xl mx-auto py-10">
          {/* Animated Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[3px] bg-slate-100 rounded-full -translate-x-1/2">
            <motion.div 
              className="absolute top-0 w-full bg-gradient-to-b from-[#2563EB] to-[#06B6D4] rounded-full"
              style={{ height: lineHeight }}
            />
          </div>

          <div className="space-y-16">
            {workflowSteps.map((step, i) => (
              <div key={i} className={`relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Center Icon */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                  <ScaleIn delay={0.2} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-xl shadow-[#2563EB]/10 border border-slate-100">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white`}>
                      <step.icon className="h-6 w-6" />
                    </div>
                  </ScaleIn>
                </div>

                {/* Content */}
                <FadeUp delay={0.3} className="ml-24 md:ml-0 md:w-1/2 w-full">
                  <div className={`bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:border-[#06B6D4]/30 hover:shadow-2xl hover:-translate-y-1 transition-all ${i % 2 === 0 ? 'md:mr-16' : 'md:ml-16'}`}>
                    <h3 className="text-2xl font-bold text-[#0B1020] mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                      <CheckCircle2 className="h-4 w-4" /> Süreç Otomatikleşti
                    </div>
                  </div>
                </FadeUp>
                
                {/* Empty space for alternating layout */}
                <div className="hidden md:block w-1/2"></div>
                
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
