'use server'

import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(6, 'Invalid phone number'),
  company: z.string().optional(),
  service_type: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export async function submitContactForm(formData: {
  name: string
  email: string
  phone: string
  company?: string
  service_type?: string
  message: string
}) {
  const result = contactSchema.safeParse(formData)
  
  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    return { success: false, errors: errorMap }
  }

  try {
    // In a real application, you could save the message in your DB, e.g.:
    // await prisma.contactMessage.create({ data: result.data })
    // Or send an email notification.
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    return { success: true }
  } catch (error) {
    console.error('Contact submission error:', error)
    return { success: false, error: 'Could not send message. Please try again later.' }
  }
}
