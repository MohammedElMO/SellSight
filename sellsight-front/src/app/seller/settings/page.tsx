'use client';

import { PageLayout } from '@/components/layout/page-layout';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { useAuthStore } from '@/store/auth';
import { useForm } from 'react-hook-form';
import { Store, Bell, Shield, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { icon: Store,   label: 'Store Info',      id: 'store'    },
  { icon: Bell,    label: 'Notifications',   id: 'notifs'   },
  { icon: Shield,  label: 'Security',        id: 'security' },
  { icon: Palette, label: 'Appearance',      id: 'theme'    },
];

export default function SellerSettingsPage() {
  const { firstName, lastName } = useAuthStore();

  const { register, handleSubmit } = useForm({
    defaultValues: { storeName: `${firstName}'s Store`, bio: '', website: '' },
  });

  const onSubmit = () => {
    toast.success('Settings saved');
  };

  return (
    <PageLayout>
      <Reveal>
        <div className="mb-7">
          <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Seller Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your store preferences and account</p>
        </div>
      </Reveal>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Reveal>
          <div className="lg:w-52 flex-none">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-2 flex flex-row lg:flex-col gap-1">
              {SECTIONS.map(s => (
                <button key={s.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-xs)] text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-all text-left">
                  <s.icon className="h-4 w-4 shrink-0" /> {s.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Main */}
        <Reveal delay={100} className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6">
              <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-5 flex items-center gap-2">
                <Store className="h-4 w-4 text-[var(--accent-text)]" /> Store Information
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Store Name',    name: 'storeName', placeholder: "Jane's Boutique", type: 'text' },
                  { label: 'Website',       name: 'website',   placeholder: 'https://youstore.com', type: 'url' },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-1.5">
                    <label className="text-[13px] font-semibold text-[var(--text-primary)]">{f.label}</label>
                    <input
                      {...register(f.name as 'storeName' | 'website')}
                      type={f.type}
                      placeholder={f.placeholder}
                      className="h-11 px-3.5 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                ))}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[var(--text-primary)]">Bio</label>
                  <textarea
                    {...register('bio')}
                    rows={3}
                    placeholder="Tell customers about your store..."
                    className="px-3.5 py-2.5 text-sm bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--accent)] transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <MagButton type="submit" variant="primary">Save changes</MagButton>
            </div>
          </form>
        </Reveal>
      </div>
    </PageLayout>
  );
}
