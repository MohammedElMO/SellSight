import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { OrderDto } from '@shared/types';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    padding: 40,
    fontSize: 10,
    color: '#1a2e2b',
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#0f766e',
    borderBottomStyle: 'solid',
  },
  brand: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
    letterSpacing: 2,
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 10,
    color: '#6b7280',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  metaBox: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#f0fdf9',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d1fae5',
    borderStyle: 'solid',
  },
  metaLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f1a18',
  },
  statusBadge: {
    backgroundColor: '#d1fae5',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#065f46',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0f766e',
    borderRadius: 4,
    marginBottom: 1,
  },
  tableHeaderCell: {
    padding: '6 10',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0faf7',
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    backgroundColor: '#f8fffd',
  },
  tableCell: {
    padding: '8 10',
    fontSize: 10,
    color: '#374151',
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: 'right' },
  col3: { flex: 1, textAlign: 'right' },
  col4: { flex: 1, textAlign: 'right' },
  totalsSection: {
    marginTop: 16,
    alignSelf: 'flex-end',
    width: 220,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalsValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f1a18',
  },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#0f766e',
    borderTopStyle: 'solid',
    marginTop: 4,
  },
  grandLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#065f46',
  },
  grandValue: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e',
  },
  footer: {
    marginTop: 32,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d1fae5',
    borderTopStyle: 'solid',
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
  },
});

function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

interface Props {
  order: OrderDto;
  paymentMethod?: string;
}

export function ReceiptDocument({ order, paymentMethod = 'Credit / Debit Card' }: Props) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const issued = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <Document title={`SellSight Receipt — ${shortId}`} author="SellSight">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>SELLSIGHT</Text>
          <Text style={styles.brandSub}>Official Receipt · Issued {issued}</Text>
        </View>

        {/* Meta boxes */}
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Order ID</Text>
            <Text style={styles.metaValue}>#{shortId}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{order.status}</Text>
            </View>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Payment</Text>
            <Text style={styles.metaValue}>{paymentMethod}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Order date</Text>
            <Text style={styles.metaValue}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, styles.col1]}>Item</Text>
          <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, styles.col3]}>Unit</Text>
          <Text style={[styles.tableHeaderCell, styles.col4]}>Subtotal</Text>
        </View>
        {order.items.map((item, i) => (
          <View key={item.productId} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
            <Text style={[styles.tableCell, styles.col1]}>{item.productName}</Text>
            <Text style={[styles.tableCell, styles.col2]}>{item.quantity}</Text>
            <Text style={[styles.tableCell, styles.col3]}>{formatUSD(item.unitPrice)}</Text>
            <Text style={[styles.tableCell, styles.col4]}>{formatUSD(item.subtotal)}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Items subtotal</Text>
            <Text style={styles.totalsValue}>{formatUSD(order.total)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Shipping</Text>
            <Text style={[styles.totalsValue, { color: '#0f766e' }]}>Free</Text>
          </View>
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total paid</Text>
            <Text style={styles.grandValue}>{formatUSD(order.total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          SellSight · This receipt was generated automatically. For support, contact us through your account.
        </Text>
      </Page>
    </Document>
  );
}
