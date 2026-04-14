import { Badge } from '@/components/ui/badge';
import type { OrderStatus } from '@shared/types';

type BadgeVariant = 'default' | 'warning' | 'info' | 'success' | 'danger';

const CONFIG: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:   { label: 'Pending',   variant: 'warning' },
  CONFIRMED: { label: 'Confirmed', variant: 'info'    },
  SHIPPED:   { label: 'Shipped',   variant: 'info'    },
  DELIVERED: { label: 'Delivered', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger'  },
};

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, size = 'md' }: Props) {
  const { label, variant } = CONFIG[status] ?? {
    label: status,
    variant: 'default' as BadgeVariant,
  };
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}
