import { Invoice } from '@/features/account/components/invoice';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Invoice id={id} />;
}
