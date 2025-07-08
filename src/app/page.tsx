import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/landing/footer';
import { ChevronRight, Lock, Users, Zap, Key } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {PricingContainer} from '@/components/pricing/PricingContainer';
import FeatureBanner from '@/components/landing/feature-banner';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-25 overflow-hidden">
        {/* Futuristic Grid Background */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(245, 233, 96, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(245, 233, 96, 0.1) 1px, transparent 1px),
                linear-gradient(rgba(31, 40, 51, 0.5) 1px, transparent 1px),
                linear-gradient(90deg, rgba(31, 40, 51, 0.5) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
            }}
          />
          {/* Animated Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5E960]/8 via-transparent to-[#F5E960]/8" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0C10]/20 to-[#0B0C10]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[0.85] tracking-tight">
              <span className="inline-block hover:scale-105 transition-transform duration-500">Truly</span>{" "}
              <span className="inline-block hover:scale-105 transition-transform duration-500 delay-75">Private</span>
              <br />
              <span className="bg-gradient-to-r from-[#F5E960] via-[#FFD600] to-[#F5E960] bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-500 delay-150">
                AI Transcription
              </span>
            </h1>
            <p className="text-lg px-6 md:text-2xl text-[#C5C6C7] mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              Keep your voice recordings and transcriptions protected with{" "}
              <span className="text-[#F5E960] font-medium">your own key</span>
              <br />
              even we can&#39;t access them.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center grid">
              <Button
                size="lg"
                className="relative bg-gradient-to-r from-[#F5E960] to-[#FFD600] text-black hover:from-[#FFD600] hover:to-[#F5E960] font-semibold px-10 py-5 text-lg rounded-2xl shadow-2xl shadow-[#F5E960]/30 hover:shadow-[#F5E960]/50 transition-all duration-500 group overflow-hidden grid-row-1 gap-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="relative z-10 flex items-center">
                  <Link href="/auth">Try BaseScribe for Free</Link>
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
              <p className="text-sm text-[#C5C6C7] grid-row-2">No credit card required</p>
            </div>
          </div>

          <FeatureBanner />

          {/* Futuristic Product Demo Mockup */}
          <div className="mt-20 relative group max-w-[550px] mx-auto text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5E960]/20 to-[#FFD600]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-gradient-to-b from-[#1F2833]/60 to-[#2C2F33]/60 rounded-3xl p-2 border border-[#F5E960]/20 shadow-2xl backdrop-blur-2xl hover:border-[#F5E960]/40 transition-all duration-700">
              <div className="bg-[#0B0C10]/80 rounded-2xl overflow-hidden backdrop-blur-xl">
                {/* Futuristic Browser Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#1F2833]/80 to-[#2C2F33]/80 border-b border-[#F5E960]/20 backdrop-blur-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-lg shadow-red-500/30"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30"></div>
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30"></div>
                  </div>
                  <div className="flex-1 max-w-md mx-4">
                    <div className="bg-[#0B0C10]/60 rounded-xl px-6 py-3 text-sm text-white border border-[#F5E960]/20 backdrop-blur-xl flex items-center">
                      <Lock className="w-4 h-4 text-[#F5E960] mr-2" />
                      <span className="text-[#F5E960]">basescribe.app</span>
                      <span className="text-[#C5C6C7]">/dashboard</span>
                    </div>
                  </div>
                  <div className="w-16"></div>
                </div>

                {/* Futuristic App Interface */}
                <div className="p-12 min-h-[300px] relative">
                  <Image
                    src="/basescribe.gif"
                    alt="BaseScribe Product Demo GIF"
                    fill
                    unoptimized
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Concern Section */}
      <section className="py-32 px-4 relative" id="features">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F2833]/15 to-transparent"></div>
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-5xl font-bold mb-8 tracking-tight">
            Ever feel <span className="text-[#F5E960]">uneasy</span> using
            <br />
            AI transcription tools?
          </h2>
          <p className="text-xl text-[#C5C6C7] mb-10 max-w-4xl mx-auto leading-relaxed">
            You&#39;re not alone. Most transcription services have serious privacy concerns.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Data Selling",
                desc: "Your recordings might be sold to third parties for profit.",
                color: "red",
              },
              {
                icon: Zap,
                title: "AI Training",
                desc: "Your voice and words could be used to train someone else's AI models.",
                color: "orange",
              },
              {
                icon: Key,
                title: "False Encryption",
                desc: '"End-to-end encryption" where they still hold the keys and can access your files.',
                color: "purple",
              },
            ].map((concern, index) => (
              <Card
                key={index}
                className="group relative bg-gradient-to-b from-[#1F2833]/40 to-[#2C2F33]/40 border border-[#2C2F33]/50 hover:border-red-500/30 text-center p-8 backdrop-blur-xl transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="pt-6 relative z-10">
                  <div className="relative mb-8 group">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center mx-auto border border-red-500/20 group-hover:border-red-500/40 transition-all duration-500">
                      <concern.icon className="w-10 h-10 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 bg-red-500/20 rounded-3xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-red-100 transition-colors duration-300">
                    {concern.title}
                  </h3>
                  <p className="text-[#C5C6C7] leading-relaxed text-lg group-hover:text-white transition-colors duration-300">
                    {concern.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced What Makes BaseScribe Different */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F2833]/15 via-transparent to-[#1F2833]/20"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-5xl font-bold mb-8 tracking-tight">
              At BaseScribe, we do it
              <br />
              <span className="bg-gradient-to-r from-[#F5E960] via-[#FFD600] to-[#F5E960] bg-clip-text text-transparent">
                differently
              </span>
            </h2>
            <p className="text-xl text-[#C5C6C7] max-w-4xl mx-auto leading-relaxed">
              True privacy isn&#39;t just a feature—it&#39;s our{" "}
              <span className="text-[#F5E960] font-semibold">foundation</span>.
            </p>
          </div>
          <div className="space-y-8">
            {[
              {
                emoji: "🔐",
                title: "You hold the encryption keys",
                desc: "Complete control over your data security. No backdoors, no master keys, no exceptions.",
              },
              {
                emoji: "🙅",
                title: "We can't access your data — even if we wanted to",
                desc: "Zero-knowledge storage ensures your privacy. We literally cannot see your content.",
              },
              {
                emoji: "🧠",
                title: "Your voice, your words, your recordings stay truly private",
                desc: "Never used for training, never shared with third parties, never stored unencrypted.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative flex items-start space-x-8 p-10 bg-gradient-to-r from-[#1F2833]/40 to-[#2C2F33]/40 rounded-3xl border border-[#2C2F33]/50 hover:border-[#F5E960]/30 backdrop-blur-xl transition-all duration-700 hover:scale-[1.02] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5E960]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="text-6xl group-hover:scale-110 transition-transform duration-500">{feature.emoji}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#F5E960] transition-colors duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-[#C5C6C7] text-lg leading-relaxed group-hover:text-white transition-colors duration-500">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Security Features */}
      <section className="py-32 px-4 relative" id="security">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F2833]/10 to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-5xl font-bold mb-8 tracking-tight">
              🛡️ Privacy focused security
              <br />
              <span className="text-[#F5E960]">made simple</span>
            </h2>
            <p className="text-xl text-[#C5C6C7] max-w-4xl mx-auto leading-relaxed">
              We handle the complex cryptography so you don&#39;t have to worry about it.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: "🔒", title: "Hybrid Encryption (RSA + AES)", desc: "We combine the speed of AES with the security of RSA, the same method trusted by banks and military" },
              { icon: "🔐", title: "SHA-256 Hashing", desc: "Industry standard encryption algorithm" },
              { icon: "🧩", title: "Encryption for Large Files", desc: "Our unique technology splits large files into 4MB encrypted chunks" },
              { icon: "🕵️", title: "Zero-knowledge Storage", desc: "We never see your content" },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative flex items-start space-x-6 p-8 bg-gradient-to-br from-[#1F2833]/40 to-[#2C2F33]/40 rounded-2xl border border-[#2C2F33]/50 hover:border-[#F5E960]/30 backdrop-blur-xl transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5E960]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#F5E960] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-[#C5C6C7] text-lg group-hover:text-white transition-colors duration-300">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingContainer country="US" />

      {/* Footer */}
      <Footer />
    </div>
  );
}
