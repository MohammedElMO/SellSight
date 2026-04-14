import Link from 'next/link';
import { Package } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import { formatPrice, formatDate } from '@/lib/utils';
import type { OrderDto } from '@shared/types';

interface OrderCardProps {
  order: OrderDto;
}

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Link
      href={`/orders/${order.id}`}
      className={[
        'block border border-[#e5e4e0] rounded-[14px] p-5 bg-white',
        'hover:border-[#ccc9c2] hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]',
        'transition-all duration-150 group',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-mono text-[#999] mb-0.5">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-sm text-[#666]">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Items preview */}
      <div className="flex flex-col gap-2 mb-4">
        {order.items.slice(0, 3).map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-[7px] bg-[#f7f6f2] border border-[#e5e4e0] flex items-center justify-center shrink-0">
                <Package className="h-3.5 w-3.5 text-[#bbb]" />
              </div>
              <span className="text-sm text-[#111] truncate">
                {item.productName}
              </span>
              <span className="text-xs text-[#999] shrink-0">
                ×{item.quantity}
              </span>
            </div>
            <span className="text-sm text-[#666] shrink-0">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-[#999] pl-10.5">
            +{order.items.length - 3} more items
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3.5 border-t border-[#f0efeb]">
        <span className="text-sm text-[#999]">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        <span className="text-[15px] font-semibold text-[#111] group-hover:text-[#000]">
          {formatPrice(order.total)}
        </span>
      </div>
    </Link>
  );
}
