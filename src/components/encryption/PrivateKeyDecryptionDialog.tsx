"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
// import { decryptPrivateKey } from '@/app/(protected)/encryption/actions';
import { useToast } from '@/components/ui/UseToast';
import { 
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PrivateKeyDecryptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  encryptedKey: string;
  onSuccess: (decryptedKey: string) => void;
}

export default function PrivateKeyDecryptionDialog({ 
  isOpen, 
  onClose, 
  userId, 
  encryptedKey,
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
      const decryptedKey = "test";
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
              <Lock className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold">Decrypt Private Key</h3>
            </div>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your encryption password"
                disabled={isSubmitting}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
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
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Decrypting..." : "Decrypt Private Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
