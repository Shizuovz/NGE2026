import { motion } from "framer-motion";
import { Crown, Award, Medal, Star } from "lucide-react";

const tiers = [
  {
    icon: Crown,
    name: "Title Sponsor",
    price: "₹5,00,000+",
    color: "border-accent text-accent",
    bg: "bg-accent/10",
    benefits: [
      "Naming rights: 'Nagaland Gaming Expo 2026 presented by [Brand]'",
      "Top branding across main stage, LED screens, live streams",
      "Premium booth space with prime location",
      "On-stage mentions & prize distribution opportunities",
      "Co-branding with Inter-College Showcase",
      "All marketing assets inclusion"
    ],
  },
  {
    icon: Award,
    name: "Powered By Sponsor",
    price: "₹2,50,000",
    color: "border-yellow-500 text-yellow-500",
    bg: "bg-yellow-500/10",
    benefits: [
      "Prominent branding on stage & LED screens",
      "Dedicated booth space at expo",
      "Live stream visibility during matches",
      "Match-time brand mentions",
      "Digital promotions across social media",
      "Logo on event materials"
    ],
  },
  {
    icon: Medal,
    name: "Associate Sponsor",
    price: "₹1,00,000",
    color: "border-gray-400 text-gray-400",
    bg: "bg-gray-400/10",
    benefits: [
      "Logo placement on all creatives and materials",
      "Booth presence at the expo",
      "Social media amplification",
      "Event day visibility",
      "Certificate of partnership",
      "Website listing"
    ],
  },
  {
    icon: Star,
    name: "Category Partners",
    price: "Custom/In-Kind",
    color: "border-cyan-500 text-cyan-500",
    bg: "bg-cyan-500/10",
    benefits: [
      "Open Tournament Partner",
      "Streaming Partner",
      "Internet/Tech Partner",
      "Cosplay Partner",
      "Custom partnership opportunities",
      "In-kind collaboration options"
    ],
  },
];

const SponsorsSection = () => {
  return (
    <section id="sponsors" className="py-20 md:py-28 section-dark">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-secondary mb-2 block">Partner With Us</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-white">
            Sponsorship <span className="text-accent">Packages</span>
          </h2>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">
            Align your brand with the future of esports in Northeast India. Choose a tier that fits your goals.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              className={`rounded-2xl border ${tier.color} ${tier.bg} p-6 flex flex-col`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <tier.icon className="h-8 w-8 mb-4" />
              <h3 className="font-['Rajdhani'] text-xl font-bold text-white mb-1">{tier.name}</h3>
              <p className="text-2xl font-bold text-white mb-4">{tier.price}</p>
              <ul className="space-y-2 flex-1">
                {tier.benefits.map((b, j) => (
                  <li key={j} className="text-sm text-white/70 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-current mt-2 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#register"
                className="mt-6 block text-center text-sm font-semibold border border-current rounded-lg py-2 hover:bg-white/10 transition-colors"
              >
                Inquire Now
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SponsorsSection;
