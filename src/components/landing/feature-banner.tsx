import { Target, Globe, Clock, Shield } from "lucide-react"

export default function FeatureBanner() {
  const features = [
    {
      icon: Target,
      text: "99.8% Accuracy",
      color: "text-red-400",
    },
    {
      icon: Globe,
      text: "99+ Languages",
      color: "text-green-400",
    },
    // {
    //   icon: Clock,
    //   text: "20 Hours of Uploads",
    //   color: "text-yellow-400",
    // },
    {
      icon: Shield,
      text: "Military Grade Encryption",
      color: "text-cyan-400",
    },
  ]

  return (
    <div className="mx-8 lg:mx-16">
      <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2C2F33] to-[#1a1a1a] rounded-2xl shadow-2xl px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-white hover:scale-105 transition-transform duration-200"
            >
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
              <span className="text-sm font-medium whitespace-nowrap">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
