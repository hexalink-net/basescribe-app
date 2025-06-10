import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              AI Transcription.<br />
              <span className="text-gray-300">Reinvented for Privacy</span>
            </h1>
            
            <p className="text-gray-400 text-lg mb-4">
              Fast. Accurate. Secure. Your files, your control.<br />
              Transcribe Securely with <span className="text-[#F0F177]">Zero-Trust Encryption</span> 🔒
            </p>

            <p className="text-gray-400 mb-8">
              <span className="font-semibold">Free 30 minutes</span> transcription. No credit card required.
            </p>

            <Button asChild size="lg" className="bg-[#F0F177] text-black hover:bg-[#F0F177]/90 rounded-full px-8">
              <Link href="/auth?mode=signup">Start transcribing for free</Link>
            </Button>

            {/* Pricing Cards */}
            <div className="grid grid-cols-2 gap-4 mt-12 max-w-lg">
              <div className="bg-zinc-900 rounded-lg p-4 relative overflow-hidden">
                <div className="bg-[#F0F177] text-black text-xs font-bold px-2 py-0.5 rounded absolute -right-8 top-3 rotate-45">
                  SAVE 33%
                </div>
                <div className="text-xl font-bold mb-1">$5 / Month</div>
                <div className="text-sm text-gray-400">$60 billed yearly</div>
              </div>
              
              <div className="flex items-center justify-center text-xl font-bold text-gray-500">OR</div>

              <div className="bg-zinc-900 rounded-lg p-4">
                <div className="text-xl font-bold mb-1">$7.5 / Month</div>
                <div className="text-sm text-gray-400">$7.5 billed monthly</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-2xl p-8 aspect-square flex items-center justify-center">
            <div className="text-gray-400">Gif video demo</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="flex items-center gap-3">
            <div className="text-[#F0F177] text-2xl">⚡</div>
            <div className="text-gray-300">Lightning Fast</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[#F0F177] text-2xl">🌐</div>
            <div className="text-gray-300">98+ Languages</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[#F0F177] text-2xl">⏱️</div>
            <div className="text-gray-300">15 Hours of Transcription</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[#F0F177] text-2xl">🔒</div>
            <div className="text-gray-300">Private & Secure</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Upload</h3>
              <p className="text-muted-foreground">Upload your audio or video files in various formats including MP3, MP4, WAV, and more.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Process</h3>
              <p className="text-muted-foreground">Our advanced ASR technology automatically transcribes your content with high accuracy.</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Download</h3>
              <p className="text-muted-foreground">Get your transcript with timestamps and download it in your preferred format.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-12">Choose the plan that's right for you</p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200">
              <div className="mb-5">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $0
                  <span className="ml-1 text-base font-medium text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-8 space-y-4 text-sm">
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>15 minutes per month</span>
                </li>
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic transcription quality</span>
                </li>
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>TXT and SRT exports</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button asChild className="w-full" variant="outline">
                  <Link href="/auth?mode=signup">Get Started</Link>
                </Button>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="group relative flex flex-col overflow-hidden rounded-lg border bg-background p-6 hover:shadow-md transition-all duration-200 border-primary/50">
              <div className="absolute -right-20 top-8 rotate-45 bg-primary px-24 py-1 text-center text-sm font-semibold text-primary-foreground">
                Popular
              </div>
              <div className="mb-5">
                <h3 className="text-2xl font-bold">Pro</h3>
                <div className="mt-4 flex items-baseline text-3xl font-bold">
                  $9.99
                  <span className="ml-1 text-base font-medium text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mb-8 space-y-4 text-sm">
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>60 minutes per month</span>
                </li>
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>High-quality transcription</span>
                </li>
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>All export formats</span>
                </li>
                <li className="flex items-center">
                  <svg className="mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority support</span>
                </li>
              </ul>
              <div className="mt-auto">
                <Button asChild className="w-full bg-primary/90 hover:bg-primary">
                  <Link href="/auth?mode=signup">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button asChild variant="link">
              <Link href="/pricing">View full pricing details</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">BaseScribe</h2>
              <p className="text-muted-foreground">Automatic audio & video transcription</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
              <div>
                <h3 className="font-semibold mb-3">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link href="/auth" className="text-muted-foreground hover:text-foreground">Sign In</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} BaseScribe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
