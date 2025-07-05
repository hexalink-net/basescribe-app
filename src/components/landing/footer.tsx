import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
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
                <p className="text-white/60">Privacy focused audio & video transcription</p>
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
    );
}