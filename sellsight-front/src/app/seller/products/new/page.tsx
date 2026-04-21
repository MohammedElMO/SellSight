'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateProduct } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { createProductSchema, type CreateProductFormValues } from '@/lib/schemas';
import { PageLayout } from '@/components/layout/page-layout';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PRODUCT_CATEGORIES } from '@/components/product/product-filters';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', description: '', price: 0, category: '', imageUrl: '', initialStock: 0 },
  });

  const imageUrl = watch('imageUrl');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const normalizedImageUrl = (imageUrl ?? '').trim();

  useEffect(() => {
    setImagePreviewError(false);
  }, [normalizedImageUrl]);

  const { mutate: create, isPending } = useCreateProduct();

  const onSubmit = (values: CreateProductFormValues) => create(values);

  return (
    <PageLayout>
      <Link
        href="/seller/products"
        className="inline-flex items-center gap-1.5 text-sm text-[#666] hover:text-[#111] transition-colors mb-7"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to products
      </Link>

      <div className="max-w-xl animate-fade-in">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold text-[#111]">New product</h1>
          <p className="text-sm text-[#666] mt-1">Fill in the details for your listing</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Product name"
            placeholder="e.g. Running Shoes Pro"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description"
            placeholder="Describe your product…"
            rows={4}
            hint="Optional — helps buyers understand the product"
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
              prefix={<span className="text-xs font-medium">$</span>}
              {...register('price', { valueAsNumber: true })}
            />
            <Select
              label="Category"
              error={errors.category?.message}
              {...register('category')}
            >
              <option value="">Select category…</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Initial stock"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            hint="How many units are available for purchase"
            error={errors.initialStock?.message}
            {...register('initialStock', { valueAsNumber: true })}
          />

          <Input
            label="Image URL"
            type="url"
            placeholder="https://example.com/image.jpg"
            error={errors.imageUrl?.message}
            hint="Optional — link to a product photo"
            {...register('imageUrl', {
              setValueAs: (value) =>
                typeof value === 'string' ? value.trim() : value,
            })}
          />

          {normalizedImageUrl && (
            <div className="rounded-[12px] overflow-hidden border border-[#e5e4e0] aspect-video">
              {!imagePreviewError ? (
                <img
                  src={normalizedImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={() => setImagePreviewError(false)}
                  onError={() => setImagePreviewError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#666] bg-[#f7f6f2] px-4 text-center">
                  Unable to load image preview. Check the URL.
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={isSubmitting || isPending} size="lg">
              <Package className="h-4 w-4" />
              Create product
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => router.push('/seller/products')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
