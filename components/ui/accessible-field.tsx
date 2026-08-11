'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

type FieldElement = React.ReactElement<Record<string, unknown>>

type AccessibleFieldProps = {
  label: string
  error?: string
  required?: boolean
  className?: string
  labelClassName?: string
  errorClassName?: string
  children: React.ReactElement
}

function asFieldElement(element: React.ReactElement): FieldElement {
  return element as FieldElement
}

function elementSlot(element: React.ReactElement): string | undefined {
  return (element.props as { 'data-slot'?: string })['data-slot']
}

function componentDisplayName(type: React.ReactElement['type']): string {
  if (typeof type === 'string') return type
  if (typeof type === 'function') {
    const fn = type as { displayName?: string; name?: string }
    return fn.displayName || fn.name || ''
  }
  if (typeof type === 'object' && type) {
    const obj = type as { displayName?: string; render?: { name?: string } }
    return obj.displayName || obj.render?.name || ''
  }
  return ''
}

function isSelectRoot(element: React.ReactElement) {
  return elementSlot(element) === 'select' || componentDisplayName(element.type) === 'Select'
}

function isSelectTrigger(element: React.ReactElement) {
  return (
    elementSlot(element) === 'select-trigger' ||
    componentDisplayName(element.type) === 'SelectTrigger'
  )
}

function isFormControl(element: React.ReactElement): boolean {
  if (typeof element.type === 'string') {
    return ['input', 'textarea', 'select', 'button'].includes(element.type)
  }
  const slot = elementSlot(element)
  if (slot === 'input' || slot === 'textarea' || slot === 'select-trigger') return true
  const name = componentDisplayName(element.type)
  return name === 'Input' || name === 'Textarea' || name === 'SelectTrigger'
}

/**
 * Wire htmlFor/id (+ aria) onto the control. Input/Textarea forward unknown props
 * to the native element; Select gets id on its trigger.
 */
function attachFieldProps(
  node: React.ReactNode,
  fieldProps: Record<string, unknown>,
): React.ReactNode {
  if (!React.isValidElement(node)) return node
  const element = asFieldElement(node)

  if (isSelectRoot(element)) {
    const children = element.props.children as React.ReactNode
    return React.cloneElement(
      element,
      {},
      React.Children.map(children, (child) => attachFieldProps(child, fieldProps)),
    )
  }

  if (isSelectTrigger(element) || isFormControl(element)) {
    const existingId = typeof element.props.id === 'string' ? element.props.id : undefined
    return React.cloneElement(element, {
      ...fieldProps,
      id: existingId ?? fieldProps.id,
    })
  }

  // Single-child wrappers (rare): recurse one level.
  const nested = element.props.children as React.ReactNode
  if (React.isValidElement(nested) && React.Children.count(nested) === 1) {
    return React.cloneElement(element, {}, attachFieldProps(nested, fieldProps) as React.ReactNode)
  }

  // Field API expects a control that accepts id — still forward so callers don't silently fail.
  const existingId = typeof element.props.id === 'string' ? element.props.id : undefined
  return React.cloneElement(element, {
    ...fieldProps,
    id: existingId ?? fieldProps.id,
  })
}

export function AccessibleField({
  label,
  error,
  required,
  className,
  labelClassName,
  errorClassName,
  children,
}: AccessibleFieldProps) {
  const fieldId = React.useId()
  const errorId = `${fieldId}-error`
  const describedBy = error ? errorId : undefined

  const control = attachFieldProps(children, {
    id: fieldId,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
    'aria-required': required ? true : undefined,
  })

  return (
    <div className={className}>
      <Label htmlFor={fieldId} className={labelClassName}>
        {label}
        {required && <span className="sr-only"> (zorunlu)</span>}
      </Label>
      {control}
      {error && (
        <p
          id={errorId}
          role="alert"
          className={cn('mt-1 text-[11px] font-medium text-rose-500', errorClassName)}
        >
          {error}
        </p>
      )}
    </div>
  )
}
