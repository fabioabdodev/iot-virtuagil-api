import type { Metadata } from 'next';
import { PaymentStatus } from '@/components/payment-status';

export const metadata: Metadata = {
  title: 'Pagamento nao concluido',
  robots: { index: false, follow: false },
};

export default function PagamentoErroPage() {
  return <PaymentStatus status="error" />;
}
