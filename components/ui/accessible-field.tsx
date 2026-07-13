'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

type AccessibleFieldProps = {
  label: string
  error?: string
  required?: boolean
  className?: string
  labelClassName?: string
  errorClassName?: string
  children: React.ReactElement
}

function isSelectRoot(element: React.ReactElement) {
  return (element.props as { 'data-slot'?: string })['data-slot'] === 'select'
}

function isSelectTrigger(element: React.ReactElement) {
  return (element.props as { 'data-slot'?: string })['data-slot'] === 'select-trigger'
}

function attachFieldProps(
  node: React.ReactNode,
  fieldProps: Record<string, unknown>
): React.ReactNode {
  if (!React.isValidElement(node)) return node

  if (isSelectRoot(node)) {
    const children = (node.props as { children?: React.ReactNode }).children
    return React.cloneElement(
      node,
      {},
      React.Children.map(children, (child) => attachFieldProps(child, fieldProps))
    )
  }

  if (isSelectTrigger(node)) {
    return React.cloneElement(node, fieldProps)
  }

  const slot = (node.props as { 'data-slot'?: string })['data-slot']
  const isFormControl =
    typeof node.type === 'string' ||
    slot === 'input' ||
    slot === 'textarea' ||
    slot === 'select-trigger'

  if (isFormControl) {
    return React.cloneElement(node, fieldProps)
  }

  return node
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
