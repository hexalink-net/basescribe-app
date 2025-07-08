"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateUserKeysAndEncryptPrivateKey } from '@/lib/encryption/client';
import { Eye, EyeOff, Lock, Shield, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/UseToast';
import { 
  BlockingDialog, 
  BlockingDialogContent, 
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
  const totalSteps = 2; // Updated to match our 2 steps (welcome, password form)
  
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setIsSubmitting(true);
    
    // Validate passwords
    // Check for minimum length
    if (password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one uppercase letter",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one lowercase letter",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    // Check for number
    if (!/[0-9]/.test(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must contain at least one number",
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
        sessionStorage.setItem("privateKey", JSON.stringify({
          privateKey: result.exportedPrivateKey,
          expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
        }));
        
        toast({
          title: "Success",
          description: "Master password set successfully!",
          variant: "default",
        });
        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set encryption password. Please try again.",
        variant: "destructive",
      });
      console.log(error)
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

  // Add animation class based on direction and animation state
  const getAnimationClass = () => {
    if (!animating) return '';
    return direction === 'forward' ? 'slide-out' : 'slide-in';
  };

  return (
    <BlockingDialog open={isOpen}>
      <BlockingDialogContent className="max-w-2xl bg-[#1a1a1a] border-[#2a2a2a] text-white p-0" style={{ height: '650px', maxHeight: '90vh' }}>
        {/* Always include a title for accessibility */}
        {currentStep === 0 && (
          <VisuallyHidden>
            <BlockingDialogTitle>
              Welcome to BaseScribe
            </BlockingDialogTitle>
          </VisuallyHidden>
        )}

        {/* Step content with animation */}
        <div className="h-full w-full" style={{ height: '450px', scrollbarWidth: 'thin' }}>
          <style jsx>{`
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
              height: 100%;
              display: flex;
              flex-direction: column;
            }
          `}</style>
          {/* Slide indicator */}
          <div className="absolute top-7 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-1.5 rounded-sm ${currentStep === 0 ? 'bg-[#F0F177]' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-1.5 rounded-sm ${currentStep === 1 ? 'bg-[#F0F177]' : 'bg-gray-700'}`}></div>
            </div>
          </div>
          
          <div className={`content-container ${getAnimationClass()} xs:px-2 sm:p-8`}>
          {currentStep === 0 ? (
            /* Introduction Step */
            <div className="flex flex-col items-center justify-center h-full mt-25">
              <div className="flex flex-col items-center text-center w-full max-w-xl mx-auto">
                <h2 className="text-xl sm:text-3xl mb-2 text-white font-bold">Welcome to BaseScribe</h2>
                <p className="text-sm sm:text-lg text-gray-300 mb-6 max-w-2xl">
                  Your privacy-first AI transcription service that keeps your files completely secure
                </p>
                
                {/* Feature Cards */}
                <div className="grid grid-cols-2 gap-7 w-full max-w-2xl mb-6">
                  {/* End-to-End Encryption Card */}
                  <div className="bg-[#1a1a1a] sm:p-4 p-2 rounded-lg border border-[#3a3a3a] flex flex-col items-center text-center shadow-md">
                    <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                      <Shield className="sm:h-8 sm:w-8 h-6 w-6 text-[#F0F177]" />
                    </div>
                    <h3 className="sm:text-lg text-sm font-semibold text-white mb-1">End-to-End Encryption</h3>
                    <p className="text-gray-400 text-sm sm:text-base">Your files are encrypted at rest and in transit</p>
                  </div>
                  
                  {/* Master Password Protected Card */}
                  <div className="bg-[#1a1a1a] sm:p-4 p-2 rounded-lg border border-[#3a3a3a] flex flex-col items-center text-center shadow-md">
                    <div className="w-12 h-12 rounded-full bg-[#333333] flex items-center justify-center mb-2">
                      <Lock className="sm:h-8 sm:w-8 h-6 w-6 text-[#F0F177]" />
                    </div>
                    <h3 className="sm:text-lg text-sm font-semibold text-white mb-1">Master Password Protected</h3>
                    <p className="text-gray-400 text-sm sm:text-base">A separate encryption key that only you know</p>
                  </div>
                </div>
                
                {/* Explanation Box */}
                <div className="bg-orange-950/30 p-4 rounded-lg border border-orange-900/50 w-full max-w-2xl mb-6 shadow-md">
                  <p className="text-orange-400 font-semibold mb-1 text-sm">Why do we need a master password?</p>
                  <p className="text-orange-100/90 text-sm">
                    This is different from your login password. Your master password acts as the encryption key for your files,
                    ensuring that even we cannot access your transcriptions. Only you can decrypt and view your files with this password.
                  </p>
                </div>
                
                {/* Get Started Button */}
                <button 
                  onClick={nextStep}
                  className="cursor-pointer mt-4 bg-[#F0F177] hover:bg-[#F0F150] text-black font-medium py-2 px-8 rounded-md transition-all duration-300 shadow-md font-bold"
                >
                  Get Started <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          ) : (
            /* Password Form Step */
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto mt-12 sm:mt-6">
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2">Set Your Master Password</h2>
                <p className="text-gray-300 text-sm sm:text-base">
                  This password will encrypt all your files. Choose a strong password you&#39;ll remember.
                </p>
              </div>
              
              {/* Warning box */}
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-2 sm:p-4 flex gap-3 mb-4 shadow-md">
                <div className="flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9V14M12 21.41H5.94C2.47 21.41 1.02 18.93 2.7 15.9L5.82 10.28L8.76 5.00003C10.5 1.79003 13.5 1.79003 15.24 5.00003L18.18 10.29L21.3 15.91C22.98 18.94 21.52 21.42 18.06 21.42H12V21.41Z" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.995 17H12.005" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-red-300 font-semibold text-sm sm:text-base">Important Notice</p>
                  <p className="text-red-200/80 text-xs sm:text-sm">
                    Please remember this password carefully. It cannot be changed or recovered. If you forget it, you will lose access to all your encrypted files permanently.
                  </p>
                </div>
              </div>
              
              {/* Password fields */}
              <div className="space-y-1">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-medium">Master Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your master password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 py-3 bg-[#222222]/70 border-[#3a3a3a] focus:border-[#3a3a3a] focus:ring-[#3a3a3a]/20"
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your master password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pr-10 py-3 bg-[#222222]/70 border-[#3a3a3a] focus:border-[#3a3a3a] focus:ring-[#3a3a3a]/20"
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
                
                {/* Password requirements */}
                <div className="mt-4">
                  <p className="text-[#F0F177] mb-3">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#F0F177" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#F0F177" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#F0F177" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">One lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#333333] flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#F0F177" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-300">One number</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 text-lg font-medium bg-[#F0F177] hover:bg-[#F0F150] text-black transition-all duration-300 shadow-md mt-2"
              >
                {isSubmitting ? "Setting Password..." : "Set Password & Continue"}
                {isSubmitting ? null : <span><KeyRound className="ml-2 w-4 h-4" /></span>}
              </Button>
            </form>
          )}
          </div>
        </div>
      </BlockingDialogContent>
    </BlockingDialog>
  );
}
