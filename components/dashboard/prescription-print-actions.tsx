'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrescriptionPrintActions() {
  return (
    <Button type="button" onClick={() => window.print()} className="bg-brand-teal text-white hover:bg-brand-teal-hover">
      <Printer className="mr-2 h-4 w-4" />
      Yazdir / PDF kaydet
    </Button>
  )
}
