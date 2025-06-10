import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-8 text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">AI Transcription.</span><br />
              <span className="relative">
                Reinvented for
                <span className="relative inline-block ml-3">
                  <span className="relative z-10">Privacy</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-[#F0F177]/30 -z-10 skew-x-3"></span>
                </span>
              </span>
            </h1>
            
            <p className="text-white/80 text-lg mb-6 leading-relaxed">
              Fast. Accurate. Secure. Your files, your control.<br />
              Transcribe Securely with <span className="text-[#F0F177] font-medium">Zero-Trust Encryption</span>
              <span className="inline-block ml-1 animate-bounce">🔒</span>
            </p>

            <p className="text-white/80 mb-10">
              <span className="font-semibold bg-gradient-to-r from-[#F0F177] to-[#d9e021] bg-clip-text text-transparent">Free 30 minutes</span> transcription. No credit card required.
            </p>

            <Button asChild size="lg" className="bg-gradient-to-r from-[#F0F177] to-[#d9e021] text-black hover:opacity-90 rounded-full px-10 py-6 font-medium shadow-lg shadow-[#F0F177]/20 transition-all duration-300 transform hover:scale-105">
              <Link href="/auth?mode=signup" className="flex items-center gap-2">
                Start transcribing for free
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </Button>

            {/* Pricing Cards */}
            <div className="grid grid-cols-2 gap-6 mt-16 max-w-lg">
              <div className="bg-zinc-900/70 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden border border-zinc-800/50 shadow-xl shadow-black/20 transition-all duration-300 hover:border-zinc-700/50 group">
                <div className="bg-gradient-to-r from-[#F0F177] to-[#d9e021] text-black text-xs font-bold px-3 py-1 rounded-full absolute -right-10 top-4 rotate-45 shadow-md">
                  SAVE 33%
                </div>
                <div className="text-2xl font-bold mb-2 group-hover:text-[#F0F177] transition-colors">$5 / Month</div>
                <div className="text-sm text-white/60">$60 billed yearly</div>
              </div>
              
              <div className="flex items-center justify-center text-xl font-bold text-white/40">OR</div>

              <div className="bg-zinc-900/70 backdrop-blur-sm rounded-xl p-6 border border-zinc-800/50 shadow-xl shadow-black/20 transition-all duration-300 hover:border-zinc-700/50 group">
                <div className="text-2xl font-bold mb-2 group-hover:text-[#F0F177] transition-colors">$7.5 / Month</div>
                <div className="text-sm text-white/60">$7.5 billed monthly</div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 backdrop-blur-sm rounded-3xl p-8 aspect-square flex items-center justify-center border border-zinc-700/30 shadow-2xl shadow-black/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F0F177]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="text-white/70 flex flex-col items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#F0F177]"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
              <span>Video demo</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-32">
          <div className="flex items-center gap-4 bg-zinc-900/30 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-lg bg-[#F0F177]/20 flex items-center justify-center text-[#F0F177] text-xl group-hover:scale-110 transition-transform duration-300">⚡</div>
            <div className="text-white font-medium">Lightning Fast</div>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/30 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-lg bg-[#F0F177]/20 flex items-center justify-center text-[#F0F177] text-xl group-hover:scale-110 transition-transform duration-300">🌐</div>
            <div className="text-white font-medium">98+ Languages</div>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/30 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-lg bg-[#F0F177]/20 flex items-center justify-center text-[#F0F177] text-xl group-hover:scale-110 transition-transform duration-300">⏱️</div>
            <div className="text-white font-medium">15 Hours of Transcription</div>
          </div>
          <div className="flex items-center gap-4 bg-zinc-900/30 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/30 hover:border-zinc-700/50 transition-all duration-300 group">
            <div className="h-10 w-10 rounded-lg bg-[#F0F177]/20 flex items-center justify-center text-[#F0F177] text-xl group-hover:scale-110 transition-transform duration-300">🔒</div>
            <div className="text-white font-medium">Private & Secure</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-zinc-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block px-6 py-2 bg-[#F0F177]/10 rounded-full text-[#F0F177] text-sm font-medium mb-6">HOW IT WORKS</div>
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Three simple steps</span>
            </h2>
            <p className="text-white/70 text-xl max-w-2xl text-center">Our streamlined process makes transcription effortless</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting line between steps */}
            <div className="hidden md:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-[#F0F177]/0 via-[#F0F177]/50 to-[#F0F177]/0"></div>
            
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300 h-full flex flex-col items-center text-center transform group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-full bg-[#F0F177]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#F0F177]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F0F177] text-black font-bold flex items-center justify-center shadow-lg">1</div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#F0F177] transition-colors">Upload</h3>
                <p className="text-white/70 leading-relaxed">Upload your audio or video files in various formats including MP3, MP4, WAV, and more. Supports files up to 2GB.</p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300 h-full flex flex-col items-center text-center transform group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-full bg-[#F0F177]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#F0F177]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F0F177] text-black font-bold flex items-center justify-center shadow-lg">2</div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#F0F177] transition-colors">Process</h3>
                <p className="text-white/70 leading-relaxed">Our advanced AI technology automatically transcribes your content with high accuracy and identifies speakers in multi-person recordings.</p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300 h-full flex flex-col items-center text-center transform group-hover:-translate-y-2">
                <div className="w-20 h-20 rounded-full bg-[#F0F177]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-[#F0F177]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#F0F177] text-black font-bold flex items-center justify-center shadow-lg">3</div>
                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#F0F177] transition-colors">Download</h3>
                <p className="text-white/70 leading-relaxed">Get your transcript with timestamps and download it in your preferred format (TXT, SRT, DOCX, PDF) for easy sharing and editing.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-20 flex justify-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#F0F177] to-[#d9e021] text-black hover:opacity-90 rounded-full px-10 py-6 font-medium shadow-lg shadow-[#F0F177]/20 transition-all duration-300 transform hover:scale-105">
              <Link href="/auth?mode=signup" className="flex items-center gap-2">
                Start transcribing now
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-black to-zinc-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block px-6 py-2 bg-[#F0F177]/10 rounded-full text-[#F0F177] text-sm font-medium mb-6">PRICING</div>
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Simple, transparent pricing</span>
            </h2>
            <p className="text-white/70 text-xl max-w-2xl text-center">Choose the plan that fits your transcription needs</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-8 border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-800 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                  <p className="text-white/60 mb-4">Perfect for occasional use</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-bold text-white">$0</span>
                    <span className="ml-2 text-lg text-white/60">/month</span>
                  </div>
                </div>
                
                <ul className="mb-8 space-y-5">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">15 minutes per month</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">Basic transcription quality</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">TXT and SRT exports</span>
                  </li>
                </ul>
                
                <div className="mt-auto">
                  <Button asChild className="w-full bg-zinc-800 hover:bg-zinc-700 text-white border-0 h-12 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                    <Link href="/auth?mode=signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-[#F0F177]/50 to-[#d9e021]/50 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-8 border border-[#F0F177]/20 hover:border-[#F0F177]/40 transition-all duration-300">
                <div className="absolute -right-16 top-7 rotate-45 bg-gradient-to-r from-[#F0F177] to-[#d9e021] px-20 py-1 text-center text-sm font-bold text-black">
                  POPULAR
                </div>
                
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F0F177]/20 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                  <p className="text-white/60 mb-4">For regular transcription needs</p>
                  <div className="flex items-baseline mb-6">
                    <span className="text-5xl font-bold text-white">$9.99</span>
                    <span className="ml-2 text-lg text-white/60">/month</span>
                  </div>
                </div>
                
                <ul className="mb-8 space-y-5">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">60 minutes per month</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">High-quality transcription</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">All export formats (TXT, SRT, DOCX, PDF)</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-[#F0F177]/20 flex items-center justify-center mr-3">
                      <svg className="h-4 w-4 text-[#F0F177]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-white/80">Priority support</span>
                  </li>
                </ul>
                
                <div className="mt-auto">
                  <Button asChild className="w-full bg-gradient-to-r from-[#F0F177] to-[#d9e021] text-black hover:opacity-90 h-12 rounded-xl font-medium shadow-lg shadow-[#F0F177]/20 transition-all duration-300 transform hover:-translate-y-1">
                    <Link href="/auth?mode=signup">Upgrade to Pro</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-white/60 max-w-2xl mx-auto">Need more transcription minutes? <Link href="/contact" className="text-[#F0F177] hover:underline">Contact us</Link> for custom enterprise plans tailored to your needs.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-zinc-900 to-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-block px-6 py-2 bg-[#F0F177]/10 rounded-full text-[#F0F177] text-sm font-medium mb-6">TESTIMONIALS</div>
            <h2 className="text-4xl md:text-6xl font-bold text-center mb-6 text-white tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">What our users say</span>
            </h2>
            <p className="text-white/70 text-xl max-w-2xl text-center">Join thousands of satisfied users who trust BaseScribe for their transcription needs</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">JD</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">James Donovan</h4>
                    <p className="text-white/60 text-sm">Podcast Host</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex text-[#F0F177] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 italic">&ldquo;BaseScribe has revolutionized my podcast workflow. I can now focus on creating content while the accurate transcriptions help with SEO and accessibility. The quality is outstanding!&rdquo;</p>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                  <p className="text-white/60 text-sm">Using BaseScribe since 2024</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg">SL</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Sarah Lin</h4>
                    <p className="text-white/60 text-sm">Content Creator</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex text-[#F0F177] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 italic">&ldquo;The multi-language support is a game-changer for my international interviews. I can get accurate transcriptions in different languages without any hassle. The export options are also incredibly useful.&rdquo;</p>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                  <p className="text-white/60 text-sm">Using BaseScribe since 2023</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-zinc-900/40 backdrop-blur-md p-8 border border-zinc-800/50 hover:border-[#F0F177]/30 transition-all duration-300">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">MJ</div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">Michael Johnson</h4>
                    <p className="text-white/60 text-sm">Researcher</p>
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex text-[#F0F177] mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-white/80 italic">&ldquo;As a researcher, accurate transcriptions of interviews are crucial. BaseScribe delivers exceptional quality and the timestamp feature makes it easy to reference specific parts of the recordings.&rdquo;</p>
                </div>
                <div className="mt-auto pt-4 border-t border-zinc-800/50">
                  <p className="text-white/60 text-sm">Using BaseScribe since 2024</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 flex justify-center">
            <Button asChild size="lg" className="bg-zinc-800 hover:bg-zinc-700 text-white border-0 rounded-full px-10 py-6 font-medium transition-all duration-300 transform hover:-translate-y-1">
              <Link href="/auth?mode=signup" className="flex items-center gap-2">
                Join our satisfied users
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-zinc-900/50 backdrop-blur-sm border-t border-zinc-800/30 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 flex items-center gap-3">
              <div>
                <Image 
                  src="/basescribe-logo.png" 
                  alt="BaseScribe Logo" 
                  width={140} 
                  height={40} 
                  className="h-8 w-auto" 
                  priority
                />
                <p className="text-white/60">Automatic audio & video transcription</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
              <div>
                <h3 className="font-semibold mb-4 text-white">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/pricing" className="text-white/70 hover:text-white transition-colors relative group">
                      Pricing
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/auth" className="text-white/70 hover:text-white transition-colors relative group">
                      Sign In
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4 text-white">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-white/70 hover:text-white transition-colors relative group">
                      Privacy Policy
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-white/70 hover:text-white transition-colors relative group">
                      Terms of Service
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F0F177] group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-zinc-800/30 mt-16 pt-8 text-center text-sm text-white/60">
            © {new Date().getFullYear()} BaseScribe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
