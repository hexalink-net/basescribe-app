'use client';

import { Button } from '@/components/ui/button';

type PlanActionFormProps = {
  planType: 'free' | 'pro';
  action: (formData: FormData) => void | Promise<void>;
  buttonText: string;
  variant?: 'default' | 'outline' | 'destructive';
};

export function PlanActionForm({ 
  action, 
  buttonText, 
  variant = 'default' 
}: PlanActionFormProps) {
  return (
    <form action={action} className="w-full">
      <Button type="submit" variant={variant} className="w-full">
        {buttonText}
      </Button>
    </form>
  );
}
