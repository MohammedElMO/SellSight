'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProduct, useUpdateProduct } from '@/lib/hooks';
import { useParams, useRouter } from 'next/navigation';
import { updateProductSchema, type ProductFormValues } from '@/lib/schemas';
import { PageLayout } from '@/components/layout/page-layout';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PRODUCT_CATEGORIES } from '@/components/product/product-filters';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(updateProductSchema),
  });

  const imageUrl = watch('imageUrl');
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const normalizedImageUrl = (imageUrl ?? '').trim();

  useEffect(() => {
    setImagePreviewError(false);
  }, [normalizedImageUrl]);

  const { data: product, isLoading } = useProduct(id);

  // Populate form once product data arrives
  useEffect(() => {
    if (product) {
      reset({
        name:        product.name,
        description: product.description ?? '',
        price:       product.price,
        category:    product.category,
        imageUrl:    product.imageUrl ?? '',
      });
    }
  }, [product, reset]);

  const { mutate: update, isPending } = useUpdateProduct(id);

  const onSubmit = (values: ProductFormValues) => update(values);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-xl flex flex-col gap-5">
          <Skeleton className="h-8 w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-[9px]" />
          ))}
        </div>
      </PageLayout>
    );
  }

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
          <h1 className="text-[28px] font-bold text-[#111]">Edit product</h1>
          <p className="text-sm text-[#666] mt-1 truncate max-w-sm">{product?.name}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Product name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Textarea
            label="Description"
            rows={4}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (USD)"
              type="number"
              min="0.01"
              step="0.01"
              error={errors.price?.message}
              prefix={<span className="text-xs font-medium">$</span>}
              {...register('price', { valueAsNumber: true })}
            />
            <Select
              label="Category"
              error={errors.category?.message}
              {...register('category')}
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Image URL"
            type="url"
            placeholder="https://example.com/image.jpg"
            error={errors.imageUrl?.message}
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
              <Save className="h-4 w-4" />
              Save changes
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
