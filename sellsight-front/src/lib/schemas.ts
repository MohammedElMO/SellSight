/**
 * Zod validation schemas — types derived from these are intentionally kept
 * compatible with the shared DTOs in shared/types/index.ts so the same shapes
 * flow from form → API call without extra conversion.
 */

import { z } from 'zod';
import type {
  LoginRequest,
  RegisterRequest,
  CreateProductRequest,
  UpdateProductRequest,
  CreateOrderRequest,
  OrderItemRequest,
} from '@shared/types';

// ── Auth ─────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
}) satisfies z.ZodType<LoginRequest>;

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'Max 50 characters'),
  lastName:  z.string().min(1, 'Last name is required').max(50, 'Max 50 characters'),
  email:     z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password:  z.string().min(6, 'Minimum 6 characters'),
  role:      z.enum(['CUSTOMER', 'SELLER', 'ADMIN']),
}) satisfies z.ZodType<RegisterRequest>;

// ── Product ──────────────────────────────────────────────────

const productBase = z.object({
  name:        z.string().min(1, 'Name is required').max(200, 'Max 200 characters'),
  description: z.string().max(2000, 'Max 2000 characters').optional(),
  /** HTML inputs use valueAsNumber:true so value is already a number */
  price:       z.number()
                  .positive('Price must be greater than 0')
                  .multipleOf(0.01, 'Max 2 decimal places'),
  category:    z.string().min(1, 'Category is required'),
  imageUrl:    z
                  .string()
                  .url('Must be a valid URL')
                  .optional()
                  .or(z.literal('')),
});

export const createProductSchema = productBase.extend({
  initialStock: z.number().int().min(0, 'Stock cannot be negative'),
}) satisfies z.ZodType<CreateProductRequest>;

export const updateProductSchema =
  productBase satisfies z.ZodType<UpdateProductRequest>;

// ── Order ────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId:   z.string().uuid('Invalid product ID'),
  productName: z.string().min(1),
  quantity:    z.number().int().positive('Quantity must be at least 1'),
  unitPrice:   z.number().positive(),
}) satisfies z.ZodType<OrderItemRequest>;

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
}) satisfies z.ZodType<CreateOrderRequest>;

// ── Inferred types ───────────────────────────────────────────

export type LoginFormValues          = z.infer<typeof loginSchema>;
export type RegisterFormValues       = z.infer<typeof registerSchema>;
export type ProductFormValues        = z.infer<typeof productBase>;
export type CreateProductFormValues  = z.infer<typeof createProductSchema>;
