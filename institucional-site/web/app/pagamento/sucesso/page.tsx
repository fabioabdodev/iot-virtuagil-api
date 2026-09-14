import type { Metadata } from 'next';
import { PaymentStatus } from '@/components/payment-status';

export const metadata: Metadata = {
  title: 'Pagamento confirmado',
  robots: { index: false, follow: false },
};

export default function PagamentoSucessoPage() {
  return <PaymentStatus status="success" />;
}
