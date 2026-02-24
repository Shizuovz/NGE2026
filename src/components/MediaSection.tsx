import { motion } from "framer-motion";
import { Video, PlayCircle, Share2, TrendingUp } from "lucide-react";

const mediaFeatures = [
  {
    icon: Video,
    title: "Professional Live Streaming",
    description: "Multi-camera production with expert shoutcasters, real-time score tracking, and high-quality broadcast infrastructure.",
    highlights: ["HD Quality", "Multi-angle coverage", "Professional commentary", "Real-time stats"]
  },
  {
    icon: PlayCircle,
    title: "Recorded Matches & Highlights",
    description: "Complete tournament recordings with edited highlight reels for maximum social media engagement and content distribution.",
    highlights: ["Full match VODs", "Highlight compilations", "Best moments", "Player interviews"]
  },
  {
    icon: Share2,
    title: "Social Media Content",
    description: "Strategic content creation across platforms with reels, shorts, and aftermovies for extended brand visibility.",
    highlights: ["Instagram Reels", "YouTube Shorts", "TikTok content", "Twitter highlights"]
  },
  {
    icon: TrendingUp,
    title: "Long-term Digital Assets",
    description: "Evergreen content that continues to generate value long after the event ends, building your brand legacy.",
    highlights: ["Documentary content", "Player profiles", "Event documentary", "Brand integration"]
  }
];

const MediaSection = () => {
  return (
    <section id="media" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-primary mb-2 block">Media & Content Value</span>
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold text-foreground">
            Beyond <span className="text-gradient">Event Day</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Your brand investment continues to work long after the expo ends through professional content production and strategic distribution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {mediaFeatures.map((feature, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-6 hover:border-primary/50 transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 inline-block">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-['Rajdhani'] text-lg font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{feature.description}</p>
              <div className="space-y-1">
                {feature.highlights.map((highlight, j) => (
                  <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                    {highlight}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ROI Value Proposition */}
        <motion.div
          className="rounded-2xl border border-border bg-gradient-to-r from-primary/10 to-secondary/10 p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-['Rajdhani'] text-2xl font-bold text-foreground mb-4">
                Extended ROI Through <span className="text-gradient">Content Strategy</span>
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Unlike traditional events that offer only momentary exposure, our comprehensive media strategy ensures your brand continues to gain visibility and engagement months after the expo concludes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">Live exposure during tournament finals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="text-sm text-foreground">Replay value through recorded content</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-sm text-foreground">Continued visibility on social platforms</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-primary mb-1">100K+</div>
                <div className="text-sm text-muted-foreground">Live Stream Views</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-secondary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Content Pieces</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-accent mb-1">1M+</div>
                <div className="text-sm text-muted-foreground">Social Impressions</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <div className="text-3xl font-bold text-foreground mb-1">3+</div>
                <div className="text-sm text-muted-foreground">Months Content Life</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MediaSection;
