'use client';

import { useAddresses, useCreateAddress, useDeleteAddress } from '@/lib/hooks';
import { Reveal } from '@/components/ui/reveal';
import { MagButton } from '@/components/ui/mag-button';
import { Pill } from '@/components/ui/pill';
import { MapPin, Plus, Trash2, Star } from 'lucide-react';
import { useState } from 'react';
import type { AddressDto } from '@shared/types';

const emptyAddress: AddressDto = {
  firstName: '', lastName: '', label: 'Home',
  street: '', city: '', state: '', zip: '', country: 'US',
  phone: '', isDefaultShipping: false, isDefaultBilling: false,
};

const inputCls = 'w-full h-10 px-3.5 text-[13px] bg-[var(--bg-input)] border border-[var(--border)] rounded-[var(--radius-sm)] outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] transition-colors';
const labelCls = 'block text-[11px] font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider';

export default function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressDto>(emptyAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAddress.mutate(form, {
      onSuccess: () => { setForm(emptyAddress); setShowForm(false); },
    });
  };

  const set = (k: keyof AddressDto, v: string | boolean) =>
    setForm({ ...form, [k]: v });

  return (
    <div className="w-full">
      <Reveal>
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display font-extrabold text-[28px] text-[var(--text-primary)] tracking-[-0.02em]">Addresses</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your shipping and billing addresses</p>
          </div>
          <MagButton variant="primary" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" /> Add Address
          </MagButton>
        </div>
      </Reveal>

      {showForm && (
        <Reveal delay={40}>
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 mb-6"
          >
            <h2 className="font-display font-semibold text-[15px] text-[var(--text-primary)] mb-4">New Address</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className={labelCls}>First Name</label><input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>Last Name</label><input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelCls}>Label</label>
                <select value={form.label} onChange={(e) => set('label', e.target.value)} className={inputCls}>
                  <option>Home</option><option>Work</option><option>Other</option>
                </select>
              </div>
              <div><label className={labelCls}>Phone</label><input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="mb-4"><label className={labelCls}>Street</label><input value={form.street} onChange={(e) => set('street', e.target.value)} required className={inputCls} /></div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><label className={labelCls}>City</label><input value={form.city} onChange={(e) => set('city', e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>State</label><input value={form.state || ''} onChange={(e) => set('state', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>ZIP</label><input value={form.zip} onChange={(e) => set('zip', e.target.value)} required className={inputCls} /></div>
            </div>
            <div className="flex gap-4 mb-5">
              <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] cursor-pointer">
                <input type="checkbox" checked={form.isDefaultShipping} onChange={(e) => set('isDefaultShipping', e.target.checked)} className="rounded accent-[var(--accent)]" />
                Default shipping
              </label>
              <label className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] cursor-pointer">
                <input type="checkbox" checked={form.isDefaultBilling} onChange={(e) => set('isDefaultBilling', e.target.checked)} className="rounded accent-[var(--accent)]" />
                Default billing
              </label>
            </div>
            <MagButton type="submit" variant="primary" disabled={createAddress.isPending}>
              {createAddress.isPending ? 'Saving…' : 'Save Address'}
            </MagButton>
          </form>
        </Reveal>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-[var(--surface)] rounded-[var(--radius)] animate-pulse" />)}
        </div>
      ) : !addresses || addresses.length === 0 ? (
        <Reveal delay={80}>
          <div
            className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-[var(--radius-lg)] text-center"
            style={{ borderColor: 'var(--border)' }}
          >
            <MapPin className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
            <h3 className="font-semibold text-[15px] text-[var(--text-secondary)] mb-1">No addresses saved</h3>
            <p className="text-[13px] text-[var(--text-tertiary)]">Add an address for faster checkout.</p>
          </div>
        </Reveal>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr, i) => (
            <Reveal key={addr.id} delay={i * 60}>
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex items-start gap-4 hover:border-[var(--border-hover)] transition-colors">
                <div
                  className="h-10 w-10 rounded-[var(--radius-xs)] flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-muted)' }}
                >
                  <MapPin className="h-4 w-4 text-[var(--accent-text)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-[13px] text-[var(--text-primary)]">{addr.label}</h3>
                    {addr.isDefaultShipping && <Pill size="sm" variant="success">Shipping</Pill>}
                    {addr.isDefaultBilling && <Pill size="sm" variant="accent">Billing</Pill>}
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)]">{addr.firstName} {addr.lastName}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">
                    {addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}
                  </p>
                </div>
                <button
                  onClick={() => addr.id && deleteAddress.mutate(addr.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-muted)] transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
