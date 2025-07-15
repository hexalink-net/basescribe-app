"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Unlock } from 'lucide-react';
import { decryptUserPrivateKey } from '@/lib/encryption/client';
import { useToast } from '@/components/ui/UseToast';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { EncryptionData } from '@/types/DashboardInterface';

interface PrivateKeyDecryptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  encryptionData: EncryptionData | null;
  onSuccess: (decryptedKey: JsonWebKey) => void;
}

export default function PrivateKeyDecryptionDialog({ 
  isOpen, 
  onClose, 
  encryptionData,
  onSuccess 
}: PrivateKeyDecryptionDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!encryptionData) {
        throw new Error("Encryption data not found");
      }
      const decryptedKey = await decryptUserPrivateKey(password, encryptionData);
      onSuccess(decryptedKey);
      onClose();
      toast({
        title: "Success",
        description: "Private key decrypted successfully",
      });
    } catch (error) {
      console.error('Error decrypting private key:', error);
      setError("Invalid password. Please try again.");
      toast({
        title: "Error",
        description: "Failed to decrypt private key. Please check your password.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Unlock className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Unlock Encrypted Files</h3>
            </div>
          </DialogTitle>
          <DialogDescription>
          For your privacy, master password are kept only in memory and expire after 1 hour or when you close the tab.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Please enter your master password"
                disabled={isSubmitting}
                className='bg-[#1a1a1a] border-[#3a3a3a] focus:border-[#4a4a4a] placeholder:text-gray-500 text-white'
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-white hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-400 font-medium mt-1">{error}</p>
            )}
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-[#3a3a3a] hover:border-[#4a4a4a] font-medium transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Decrypting</span>
                  <span className="animate-pulse">...</span>
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
