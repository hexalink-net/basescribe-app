import { cn } from '@/lib/StyleUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/landing/card';
import { Button } from '@/components/ui/button';
import { signInWithGoogle } from '@/app/auth/action';
import Image from 'next/image';
import Link from 'next/link';
import { pro } from '@/constants/PaddleProduct';
import { ArrowRight, Check } from 'lucide-react';

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
        'border border-[#2a2a2a]/50 rounded-lg backdrop-blur-sm overflow-hidden',
        'transition-all duration-300 hover:border-[#3a3a3a]/70 shadow-xl',
        'animate-in fade-in-50'
      )}
    >
      <Card className="group relative bg-[#1a1a1a] border border-[#2C2F33]/50 hover:border-[#F5E960]/30 transition-all duration-700 hover:scale-105 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#F5E960]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <CardHeader className="text-center pb-8 relative z-10">
                <CardTitle className="text-4xl font-bold text-white mb-2">FREE</CardTitle>
                <p className="text-[#C5C6C7] text-xl">Perfect for trying out BaseScribe</p>
                <div className="text-5xl font-bold mt-6">
                  <span className="bg-gradient-to-r from-[#F5E960] to-[#FFD600] bg-clip-text text-transparent">$0</span>
                  <span className="text-xl text-[#C5C6C7]">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="space-y-6">
                  {['1 hour transcriptions per month', '99+ language support', 'Max file size: 200 MB per upload', 'Single file upload', 'File and transcript encryption included'].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-4 group">
                      <div className="relative">
                        <Check className="w-6 h-6 text-[#F5E960]" />
                        <div className="absolute inset-0 bg-[#F5E960] rounded-full blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                      </div>
                      <span className="text-white text-lg">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className={'px-8 mt-22'}>
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
                        className="w-full text-[#F0F177] hover:text-[#d9e021] hover:bg-transparent transition-colors mb-4" 
                        asChild
                      >
                        <Link href="/auth">Sign up with email address</Link>
                      </Button>
                    </div>
                  ) : !isSubscribed ? (
                    // User logged in but not subscribed - show "Current Plan"
                    <Button className="mt-2 mb-4 w-full bg-[#222222]/50 hover:bg-[#2a2a2a] text-white border-[#3a3a3a] transition-all" variant="outline">
                      <span className="flex items-center justify-center gap-1">
                        Current Plan
                      </span>
                    </Button>
                  ) : (
                    // User logged in and subscribed - hide buttons
                    null
                  )}
                </div>
              </CardContent>
            </Card>
    </div>
  );
}