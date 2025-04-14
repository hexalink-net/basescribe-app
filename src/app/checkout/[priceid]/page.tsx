import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { CheckoutContents } from '@/components/checkout/CheckoutContents';
import { createClient } from '@/lib/supabase/server';

type tParams = Promise<{ priceId: string }>;

export default async function CheckoutPage({ params }: { params: tParams }) {
  const { priceId } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <div className={'w-full min-h-screen relative overflow-hidden'}>
      <div
        className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-[24px] flex flex-col gap-6 justify-between'}
      >
        <CheckoutHeader />
        <CheckoutContents userEmail={data.user?.email} priceId={priceId}/>
      </div>
    </div>
  );
}
