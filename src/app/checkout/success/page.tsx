import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function SuccessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main>
      <div className={'relative h-screen overflow-hidden bg-[#171717]'}>
        <div className={'absolute inset-0 px-6 flex items-center justify-center'}>
          <div className={'flex flex-col items-center text-zinc-900 dark:text-white text-center'}>
            <h1 className={'text-4xl md:text-[80px] leading-9 md:leading-[80px] font-medium pb-6 text-white'}>
              Payment successful
            </h1>
            <p className={'text-lg pb-16 text-white'}>Success! Your payment is complete, and you’re all set.</p>
            <Button variant={'secondary'} asChild={true} className={'bg-[#182222] hover:bg-[#2a2a2a] text-white'}>
              {data.user ? <Link href={'/dashboard'}>Go to Dashboard</Link> : <Link href={'/'}>Go to Home</Link>}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}