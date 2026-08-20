'use client'

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type SelectHTMLAttributes,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Labeled field wrapper with required marker + accessible error/hint wiring. */
export function Field({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  error?: string | null
  hint?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-slate-800">
        {label}
        {required ? <span className="ml-0.5 text-rose-500" aria-hidden> *</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] font-medium text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

const baseControl =
  'w-full min-h-[46px] rounded-xl border border-[var(--rz-border)] bg-white px-3.5 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--rz-blue)] focus:ring-2 focus:ring-[var(--rz-blue)]/25 disabled:opacity-60'

export function TextInput({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return <input {...props} aria-invalid={invalid || undefined} className={cn(baseControl, invalid && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200', className)} />
}

export function DateInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <TextInput type="date" {...props} />
}

export function TextArea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(baseControl, 'min-h-[92px] resize-y py-2.5 leading-relaxed', invalid && 'border-rose-400', className)}
    />
  )
}

export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(baseControl, 'appearance-none pr-9', className)}>
      {children}
    </select>
  )
}

export function SubmitButton({
  children,
  loading,
  disabled,
  type = 'submit',
  variant = 'primary',
  onClick,
  className,
}: {
  children: ReactNode
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button'
  variant?: 'primary' | 'ghost' | 'danger'
  onClick?: () => void
  className?: string
}) {
  const styles =
    variant === 'primary'
      ? 'bg-[var(--rz-blue)] text-white hover:bg-[var(--rz-blue-hover)]'
      : variant === 'danger'
        ? 'bg-rose-600 text-white hover:bg-rose-700'
        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60',
        styles,
        className,
      )}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  )
}

/** Accessible bottom-sheet modal: ESC to close, scroll lock, backdrop dismiss. */
export function SheetModal({
  open,
  onClose,
  title,
  children,
  closeLabel = 'Kapat',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  closeLabel?: string
}) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-[1.75rem] bg-[var(--rz-surface,#fff)] shadow-2xl outline-none sm:rounded-[1.75rem]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--rz-border)] px-5 py-4">
          <h2 id={titleId} className="rz-section-title text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex size-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <SheetModal open={open} onClose={onCancel} title={title} closeLabel={cancelLabel}>
      {description ? <p className="rz-body text-slate-600">{description}</p> : null}
      <div className="mt-5 flex flex-col gap-2">
        <SubmitButton type="button" variant="danger" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </SubmitButton>
        <SubmitButton type="button" variant="ghost" disabled={loading} onClick={onCancel}>
          {cancelLabel}
        </SubmitButton>
      </div>
    </SheetModal>
  )
}

/** Detail key/value row for record detail sheets. */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between gap-4 border-b border-[var(--rz-border)] py-2.5 last:border-0">
      <dt className="shrink-0 text-[13px] font-medium text-slate-500">{label}</dt>
      <dd className="text-right text-[14px] font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
