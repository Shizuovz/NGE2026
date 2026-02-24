import { CalendarDays, MapPin, Mail, Phone } from "lucide-react";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Games", href: "#games" },
  { label: "Expo", href: "#expo" },
  { label: "Media", href: "#media" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Gallery", href: "#gallery" },
  { label: "Register", href: "#register" },
];

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/NGE.png" 
                alt="NGE 2026 Logo" 
                className="h-12 w-auto"
              />
              <h3 className="font-['Rajdhani'] text-2xl font-bold">
                <span className="text-primary">NGE</span> 2026
              </h3>
            </div>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              Organized by Nagaland E-Sports Society (NESS). Building the future of competitive gaming in Northeast India.
            </p>
            <div className="space-y-2 text-sm text-background/60">
              <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> June 2026</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kohima Old Secretariat, Nagaland</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Rajdhani'] text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-['Rajdhani'] text-lg font-bold mb-4">Contact NESS</h4>
            <div className="space-y-2 text-sm text-background/60">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@ngeness2026.com</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 700XX XXXXX</p>
              <div className="pt-2">
                <p className="font-semibold mb-1">Next Steps:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Confirm sponsorship category</li>
                  <li>• Customize brand integration</li>
                  <li>• Finalize deliverables & timelines</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-xs text-background/40">
          © 2026 Nagaland E-Sports Society. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
