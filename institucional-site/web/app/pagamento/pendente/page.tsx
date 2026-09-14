import type { Metadata } from 'next';
import { PaymentStatus } from '@/components/payment-status';

export const metadata: Metadata = {
  title: 'Pagamento em processamento',
  robots: { index: false, follow: false },
};

export default function PagamentoPendentePage() {
  return <PaymentStatus status="pending" />;
}
