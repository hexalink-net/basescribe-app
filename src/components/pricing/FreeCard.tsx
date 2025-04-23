import { cn } from '@/lib/StyleUtils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/auth/action';
import Image from 'next/image';
import Link from 'next/link';
import { pro } from '@/constants/PaddleProduct';

interface Props {
  user?: { id: string; email?: string } | null;
  userSubs?: { product_id: string } | null;
}

export function FreeCard({user, userSubs} : Props) {
  const { id: currentUserId } = user || {};
  const isSubscribed = userSubs?.product_id === pro;

  return (
    <div key="free" className={cn('border rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden')}>
      <div className={cn('flex flex-col rounded-lg rounded-b-none pricing-card-border')}>
        <div className={cn('flex justify-between items-center px-8 pt-8')}>
          <div className={'flex items-center gap-[10px]'}>
            <Image src={'/assets/icons/price-tiers/free-icon.svg'} height={40} width={40} alt={'Free'} />
            <p className={'text-[20px] leading-[30px] font-semibold'}>Free</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col px-8">
          <div className={cn('text-[80px] leading-[96px] tracking-[-1.6px] font-medium')}>
            FREE
          </div>
          <div className={cn('font-medium leading-[12px] text-[12px]')}>per user/month</div>
        </div>
        <div className={'px-8'}>
          <Separator className={'bg-border'} />
        </div>
        <div className={'px-8 text-[16px] leading-[24px]'}>Free tier is available for all users.</div>
      </div>
      <div className={'px-8 mt-8'}>
        {!currentUserId ? (
          // User not logged in - show sign up buttons
          <div className="flex flex-col gap-3">
            <form action={signInWithGoogle}>
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black" 
                variant="outline"
              >
                <Image 
                  src="/google-logo.png" 
                  alt="Google logo" 
                  width={20} 
                  height={20} 
                />
                Start Transcribing for Free
              </Button>
            </form>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/auth">Sign up with email address</Link>
            </Button>
          </div>
        ) : !isSubscribed ? (
          // User logged in but not subscribed - show "Current Plan"
          <Button className={'w-full'} variant={'secondary'} asChild={true}>
            <p>Current Plan</p>
          </Button>
        ) : (
          // User logged in and subscribed - hide buttons
          null
        )}
      </div>
    </div>
  );
}