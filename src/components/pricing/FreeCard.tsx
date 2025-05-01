import { cn } from '@/lib/StyleUtils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/auth/action';
import Image from 'next/image';
import Link from 'next/link';
import { pro } from '@/constants/PaddleProduct';
import { ArrowRight } from 'lucide-react';

interface Props {
  user?: { id: string; email?: string } | null;
  userSubs?: { product_id: string } | null;
}

export function FreeCard({user, userSubs} : Props) {
  const { id: currentUserId } = user || {};
  const isSubscribed = userSubs?.product_id === pro;

  return (
    <div 
      key="free" 
      className={cn(
        'border border-[#2a2a2a]/50 rounded-lg bg-[#1a1a1a]/50 backdrop-blur-sm overflow-hidden',
        'transition-all duration-300 hover:border-[#3a3a3a]/70 shadow-xl',
        'animate-in fade-in-50'
      )}
    >
      <div className={cn('flex flex-col rounded-lg rounded-b-none pricing-card-border')}>
        <div className="px-8 pt-8 mb-2">
          <h3 className="text-xl font-semibold">Free</h3>
          <p className="text-sm text-muted-foreground">Free tier is available for all users.</p>
        </div>
        <div className="mt-6 flex flex-col px-8">
          <div className={cn('text-[80px] leading-[96px] tracking-[-1.6px] font-medium text-white')}>
            FREE
          </div>
          <div className={cn('font-medium leading-[12px] text-[12px] text-gray-400')}>per user/month</div>
        </div>
        <div className={'px-8'}>
          <Separator className={'bg-[#2a2a2a]'} />
        </div>
        <div className={'px-8 text-[16px] leading-[24px] text-gray-300'}>Free tier is available for all users.</div>
      </div>
      <div className={'px-8 mt-8'}>
        {!currentUserId ? (
          // User not logged in - show sign up buttons
          <div className="flex flex-col gap-3">
            <form action={signInWithGoogle}>
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] hover:text-white transition-all group" 
                variant="outline"
              >
                <Image 
                  src="/google-logo.png" 
                  alt="Google logo" 
                  width={20} 
                  height={20} 
                  className="transition-transform group-hover:scale-105"
                />
                <span className="flex items-center justify-center gap-1">
                  Start Transcribing for Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </form>
            <Button 
              variant="ghost" 
              className="w-full text-[#F0F177] hover:text-[#d9e021] hover:bg-transparent transition-colors" 
              asChild
            >
              <Link href="/auth">Sign up with email address</Link>
            </Button>
          </div>
        ) : !isSubscribed ? (
          // User logged in but not subscribed - show "Current Plan"
          <Button className="w-full bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] transition-all" variant="outline">
            <span className="flex items-center justify-center gap-1">
              Current Plan
            </span>
          </Button>
        ) : (
          // User logged in and subscribed - hide buttons
          null
        )}
      </div>
      <div className="px-8 pb-8">
      <div className="text-sm font-medium mb-3">
        {'Everything in Business, plus:'}
      </div>
      <ul className="space-y-3">
        {['Integrations', 'Unlimited workspaces', 'Advanced editing tools', 'Everything in Starter'].map((feature: string) => (
          <li key={feature} className="flex items-start">
            <svg 
              className={cn(
                "h-5 w-5 mr-2 flex-shrink-0",
                "text-yellow-500"
              )} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}