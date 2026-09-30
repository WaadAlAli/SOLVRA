import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please enter a valid email address'),

    password: passwordSchema,

    confirmPassword: z.string(),

    role: z.enum(['BUYER', 'SUPPLIER']),

    displayName: z
      .string()
      .trim()
      .min(2, 'Display name must be at least 2 characters')
      .max(100, 'Display name is too long'),

    buyerType: z.enum(['INDIVIDUAL', 'BUSINESS', 'INSTITUTION']).optional(),

    location: z
      .string()
      .trim()
      .min(2, 'Location must be at least 2 characters')
      .max(150, 'Location is too long')
      .optional(),

    phone: z.string().trim().max(30, 'Phone number is too long').optional(),

    companyName: z
      .string()
      .trim()
      .min(2, 'Company name must be at least 2 characters')
      .max(150, 'Company name is too long')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }

    if (data.role === 'BUYER' && !data.buyerType) {
      ctx.addIssue({
        code: 'custom',
        path: ['buyerType'],
        message: 'Buyer type is required',
      })
    }

    if (data.role === 'BUYER' && !data.location) {
      ctx.addIssue({
        code: 'custom',
        path: ['location'],
        message: 'Location is required',
      })
    }

    if (data.role === 'SUPPLIER' && !data.companyName) {
      ctx.addIssue({
        code: 'custom',
        path: ['companyName'],
        message: 'Company name is required',
      })
    }
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),

  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required'),

    password: passwordSchema,

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      })
    }
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
