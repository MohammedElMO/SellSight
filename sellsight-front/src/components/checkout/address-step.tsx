import { useQuery } from '@tanstack/react-query';
import { addressApi } from '@/lib/services';
import { MapPin, Plus, Check } from 'lucide-react';
import Link from 'next/link';

interface AddressStepProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export default function AddressStep({ selectedId, onSelect, onNext }: AddressStepProps) {
  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: addressApi.getAll,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const hasAddresses = addresses && addresses.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Select Shipping Address</h2>
        <Link 
          href="/addresses" 
          className="text-sm font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
        >
          <Plus size={16} /> Add New
        </Link>
      </div>

      {!hasAddresses ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <MapPin className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">You don't have any saved addresses</p>
          <Link href="/addresses" className="btn-outline inline-block">
            Create an Address
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => {
            const isSelected = selectedId === addr.id || (!selectedId && addr.isDefaultShipping);
            
            // Auto-select default if none selected
            if (!selectedId && addr.isDefaultShipping && addr.id) {
              setTimeout(() => onSelect(addr.id!), 0);
            }

            return (
              <div 
                key={addr.id}
                onClick={() => addr.id && onSelect(addr.id)}
                className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 text-[var(--accent)]">
                    <Check size={20} />
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <MapPin className={isSelected ? 'text-[var(--accent)]' : 'text-gray-400'} size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{addr.firstName} {addr.lastName}</span>
                      {addr.label && (
                        <span className="px-2 py-0.5 bg-gray-100 text-xs font-medium rounded text-gray-600">
                          {addr.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {addr.street}<br />
                      {addr.city}, {addr.state} {addr.zip}<br />
                      {addr.country}
                    </p>
                    {addr.phone && <p className="text-sm text-gray-500 mt-2">Phone: {addr.phone}</p>}
                  </div>
                </div>
              </div>
            );
          })}

          <button 
            className="btn-primary w-full mt-8 py-3 text-lg"
            disabled={!selectedId && !addresses.some(a => a.isDefaultShipping)}
            onClick={onNext}
          >
            Continue to Payment
          </button>
        </div>
      )}
    </div>
  );
}
