"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateUserKeysAndEncryptPrivateKey } from '@/app/(protected)/encryption/actions';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Shield, FileKey } from 'lucide-react';
import { useToast } from '@/components/ui/UseToast';
import { 
  BlockingDialog, 
  BlockingDialogContent, 
  BlockingDialogFooter, 
  BlockingDialogHeader, 
  BlockingDialogTitle 
} from './BlockingDialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface EncryptionPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function EncryptionPasswordDialog({ isOpen, onClose, userId }: EncryptionPasswordDialogProps) {
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Step navigation
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [animating, setAnimating] = useState(false);
  const totalSteps = 3; // Updated to match our 3 steps (welcome, info, password form)
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setIsSubmitting(true);
    
    // Validate passwords
    if (password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Invalid Password",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Call server action to save the encryption password
      const result = await generateUserKeysAndEncryptPrivateKey(userId, password);
      
      if (result.error) {
        toast({
          title: "Invalid Password",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Encryption password set successfully!",
          variant: "default",
        });
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to set encryption password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Navigation handlers with animation
  const nextStep = () => {
    if (currentStep < totalSteps - 1 && !animating) {
      setDirection('forward');
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          setAnimating(false);
        }, 300);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0 && !animating) {
      setDirection('backward');
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setTimeout(() => {
          setAnimating(false);
        }, 300);
      }, 300);
    }
  };
  
  // Add animation class based on direction and animation state
  const getAnimationClass = () => {
    if (!animating) return '';
    return direction === 'forward' ? 'slide-out' : 'slide-in';
  };

  return (
    <BlockingDialog open={isOpen}>
      <BlockingDialogContent className="sm:max-w-md w-[500px] p-0 overflow-hidden" style={{ height: '600px' }}>
        {/* Always include a title for accessibility */}
        {currentStep < 2 && (
          <VisuallyHidden>
            <BlockingDialogTitle>
              {currentStep === 0 ? "Welcome to BaseScribe" : "File Encryption Password"}
            </BlockingDialogTitle>
          </VisuallyHidden>
        )}

        {/* Step content with animation */}
        <div className="p-6 relative overflow-y-auto" style={{ height: '450px', scrollbarWidth: 'thin' }}>
          <style jsx global>{`
            @keyframes slideOutLeft {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(-30px); opacity: 0; }
            }
            @keyframes slideInLeft {
              from { transform: translateX(30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
              from { transform: translateX(0); opacity: 1; }
              to { transform: translateX(30px); opacity: 0; }
            }
            @keyframes slideInRight {
              from { transform: translateX(-30px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .slide-out {
              animation: ${direction === 'forward' ? 'slideOutLeft' : 'slideOutRight'} 0.3s ease-in-out forwards;
            }
            .slide-in {
              animation: ${direction === 'forward' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-in-out forwards;
            }
            .content-container {
              transition: all 0.3s ease-in-out;
            }
          `}</style>
          <div className={`content-container ${getAnimationClass()}`}>
          {currentStep === 0 ? (
            /* Introduction Step */
            <div className="space-y-6 flex flex-col items-center justify-center h-full">
              <div className="flex flex-col items-center text-center max-w-sm">
                <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                  <Lock className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Welcome to BaseScribe</h2>
                <p className="text-gray-300 mb-3 text-lg">We're glad to have you on board!</p>
                <p className="text-gray-400 mb-3">At BaseScribe, your privacy comes first. To ensure your files stay secure, we use cryptographic encryption — and that means you're the only one who can access your files.</p>
                <p className="text-gray-300 font-medium text-lg mt-4">For this reason, we require you to set an encryption password to protect your files.</p>
                <p className="text-gray-400 mt-4">To get started, please click "Next".</p>
              </div>
            </div>
          ) : currentStep === 1 ? (
            <div className="space-y-8 flex flex-col h-full justify-center">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-20 w-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                  <FileKey className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600">File Encryption Password</h3>
                <p className="text-gray-300 text-lg max-w-sm">
                  Your files will be protected with end-to-end encryption for maximum security.
                </p>
              </div>
              
              <div className="space-y-6 max-w-sm mx-auto bg-gray-900/30 p-6 rounded-xl">
                <div className="flex items-start">
                  <div className="bg-green-500/20 p-2 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-400">Enhanced Security</h4>
                    <p className="text-gray-300">Your files are encrypted before storage, ensuring only you can access them.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-500/20 p-2 rounded-full mr-4">
                    <Lock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-400">Separate from Login</h4>
                    <p className="text-gray-300">This password is different from your account password for added protection.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-red-500/20 p-2 rounded-full mr-4">
                    <ArrowRight className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-400">Cannot Be Recovered</h4>
                    <p className="text-gray-300">If you forget this password, we cannot recover your files. Please store it securely.</p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-700/50 text-center">
                  <p className="text-sm text-gray-400">
                    To learn more about how we protect your data, please visit our <a href="https://basescribe.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-medium">Privacy Policy</a>.
                  </p>
                </div>
              </div>
            </div>
          ): (
            /* Password Form Step */
            <form onSubmit={handleSubmit} className="space-y-2 max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5 text-blue-500" />
                <BlockingDialogTitle className="text-xl font-semibold">Set Your Encryption Password</BlockingDialogTitle>
              </div>    
              <div className="grid gap-3">
                <Label htmlFor="password" className="text-gray-300 text-lg font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your encryption password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 py-6 bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-lg"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword" className="text-gray-300 text-lg font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your encryption password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10 py-6 bg-gray-900/50 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20 text-lg"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-800/50 mt-2">
                  <p className="text-sm text-blue-300">
                    Make sure to use a strong password with at least 8 characters including numbers and special characters.  
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 py-6 text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-700/30"
              >
                {isSubmitting ? "Setting Password..." : "Set Encryption Password"}
              </Button>
            </form>
          )}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <BlockingDialogFooter className="flex justify-between items-center p-6">
          {currentStep > 0 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < totalSteps - 1 && currentStep !== 2 && (
            <Button 
              type="button" 
              onClick={nextStep}
              className="flex items-center gap-2"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </BlockingDialogFooter>
      </BlockingDialogContent>
    </BlockingDialog>
  );
}
