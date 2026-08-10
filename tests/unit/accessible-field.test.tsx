import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { AccessibleField } from '@/components/ui/accessible-field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

describe('AccessibleField (P1-06)', () => {
  it('associates Label htmlFor with Input id', () => {
    render(
      <AccessibleField label="Ad Soyad">
        <Input />
      </AccessibleField>,
    )
    const control = screen.getByRole('textbox', { name: 'Ad Soyad' })
    expect(control).toBeTruthy()
    expect(control.id).toBeTruthy()
    const label = screen.getByText('Ad Soyad')
    expect(label.getAttribute('for')).toBe(control.id)
  })

  it('associates Label with Textarea', () => {
    render(
      <AccessibleField label="Açık Adres">
        <Textarea />
      </AccessibleField>,
    )
    expect(screen.getByRole('textbox', { name: 'Açık Adres' })).toBeTruthy()
  })

  it('associates Label with Select trigger', () => {
    render(
      <AccessibleField label="Cinsiyet">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Seçiniz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Kadın">Kadın</SelectItem>
          </SelectContent>
        </Select>
      </AccessibleField>,
    )
    const trigger = screen.getByRole('combobox', { name: 'Cinsiyet' })
    expect(trigger).toBeTruthy()
    expect(trigger.id).toBeTruthy()
  })

  it('wires aria-invalid and describedby when error is set', () => {
    render(
      <AccessibleField label="Telefon" error="Zorunlu alan" required>
        <Input />
      </AccessibleField>,
    )
    const control = screen.getByRole('textbox', { name: /Telefon/ })
    expect(control.getAttribute('aria-invalid')).toBe('true')
    expect(control.getAttribute('aria-required')).toBe('true')
    const describedBy = control.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy!)?.textContent).toContain('Zorunlu alan')
  })
})
