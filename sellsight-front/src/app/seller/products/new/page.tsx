'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/lib/services';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { createProductSchema, type ProductFormValues } from '@/lib/schemas';
import { PageLayout } from '@/components/layout/page-layout';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PRODUCT_CATEGORIES } from '@/components/product/product-filters';
import toast from 'react-hot-toast';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (role !== 'SELLER' && role !== 'ADMIN') router.replace('/products');
  }, [isAuthenticated, role, router]);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '', description: '', price: 0, category: '', imageUrl: '' },
  });

  const imageUrl = watch('imageUrl');

  const { mutate: create, isPending } = useMutation({
    mutationFn: (req: ProductFormValues) =>
      productApi.create({
        ...req,
        description: req.description || undefined,
        imageUrl:    req.imageUrl    || undefined,
      }),
    onSuccess: () => {
      toast.success('Product created!');
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      router.push('/seller/products');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create product';
      toast.error(msg);
    },
  });

  const onSubmit = (values: ProductFormValues) => create(values);

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
            label="Image URL"
            type="url"
            placeholder="https://example.com/image.jpg"
            hint="Optional — link to a product photo"
            {...register('imageUrl')}
          />

          {imageUrl && (
            <div className="rounded-[12px] overflow-hidden border border-[#e5e4e0] aspect-video">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
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
