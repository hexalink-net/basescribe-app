import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function CheckoutHeader() {
  return (
    <div className={'flex gap-4'}>
      <Link href={'/pricing'}>
        <Button variant={'secondary'} className={'h-[32px] bg-muted bg-[#182222] border-border w-[32px] p-0 rounded-[4px] text-white'}>
          <ChevronLeft />
        </Button>
      </Link>
      <Image src={'/basescribe-logo.png'} alt={'BaseScribe'} width={200} height={28} />
    </div>
  );
}