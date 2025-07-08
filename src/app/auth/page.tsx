"use client"
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/UseToast';
import { signInWithGoogle, signInWithEmailPassword, signUpWithEmailPassword } from './action';
import { Mail, Lock, ArrowRight } from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  if (!searchParams) {
    return <div>Loading...</div>;
  }
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create a FormData object from the form
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      
      if (mode === 'signup') {
        const result = await signUpWithEmailPassword(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        toast({
          title: result.title || "Check your email",
          description: result.message || "We've sent you a confirmation link to complete your signup.",
        });
        
      } else {        
        const result = await signInWithEmailPassword(formData);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.success) {          
          toast({
            title: "Signed in successfully",
            description: "Welcome back to BaseScribe!",
          });
          
          // Redirect directly to dashboard
          router.push('/dashboard');
        }
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#111111] to-[#0a0a0a] text-white p-4">
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome to <span className="text-gradient">BaseScribe</span></h1>
          <p className="text-gray-400">The most secure AI transcription tool</p>
        </div>
        
        <Card className="bg-[#1a1a1a]/50 backdrop-blur-sm border-[#2a2a2a]/50 text-white overflow-hidden transition-all duration-300 hover:border-[#3a3a3a]/70 shadow-xl animate-in fade-in-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {mode === 'signup' 
                ? 'Enter your email below to create your account'
                : 'Enter your email and password to sign in'}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm text-gray-300">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={16} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#222222]/70 border-[#3a3a3a]/50 focus:border-[#F0F177]/50 focus:ring-[#F0F177]/10 pl-10 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm text-gray-300">Password</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-[#222222]/70 border-[#3a3a3a]/50 focus:border-[#F0F177]/50 focus:ring-[#F0F177]/10 pl-10 text-white"
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#F0F177] to-[#d9e021] hover:from-[#e8e96f] hover:to-[#c7ce1f] transition-all shadow-lg hover:shadow-[#F0F177]/20 text-black font-medium" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center text-black">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 group">
                    {mode === 'signup' ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-black" />
                  </span>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#2a2a2a]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#1a1a1a] px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full border-[#3a3a3a] bg-[#222222]/50 hover:bg-[#2a2a2a] text-white hover:text-white transition-all"
                onClick={signInWithGoogle}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </span>
              </Button>
            </CardContent>
            
            <CardFooter className="flex justify-center pb-6 pt-2">
              <div className="text-center text-sm text-gray-400">
                {mode === 'signup' ? (
                  <p>
                    Already have an account?{" "}
                    <a
                      href="/auth"
                      className="text-[#F0F177] hover:text-[#d9e021] transition-colors"
                    >
                      Sign in
                    </a>
                  </p>
                ) : (
                  <p>
                    Don&rsquo;t have an account?{" "}
                    <a
                      href="/auth?mode=signup"
                      className="text-[#F0F177] hover:text-[#d9e021] transition-colors"
                    >
                      Sign up
                    </a>
                  </p>
                )}
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-[#111111] to-[#0a0a0a] text-white">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-[#F0F177] rounded-full animate-bounce"></div>
          <div className="h-4 w-4 bg-[#F0F177] rounded-full animate-bounce delay-100"></div>
          <div className="h-4 w-4 bg-[#F0F177] rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
