import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { CheckoutContents } from '@/components/checkout/CheckoutContents';
import { createClient } from '@/lib/supabase/server';
import { updateUserCustomerId } from '../actions';

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return (
    <div className={'w-full min-h-screen relative overflow-hidden'}>
      <div
        className={'mx-auto max-w-6xl relative px-[16px] md:px-[32px] py-[24px] flex flex-col gap-6 justify-between'}
      >
        <CheckoutHeader />
        <CheckoutContents userEmail={data.user?.email} updateCustomerId={updateUserCustomerId} />
      </div>
    </div>
  );
}
