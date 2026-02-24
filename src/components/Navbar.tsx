import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Schedule", href: "#schedule" },
  { label: "Games", href: "#games" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Gallery", href: "#gallery" },
  { label: "Register", href: "#register" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/40 py-3 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a 
          href="#" 
          className="relative z-[110] font-['Rajdhani'] text-2xl font-bold tracking-tighter flex items-center gap-2"
        >
          <img 
            src="/NGE.png" 
            alt="NGE 2026 Logo" 
            className={`h-16 w-auto transition-all duration-300 ${
              scrolled ? 'opacity-100' : 'opacity-90'
            }`}
          />
          {/* <div className="flex flex-col leading-tight">
            <span className={`text-lg font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent ${
              scrolled ? 'text-lg' : 'text-xl'
            }`}>
              NGE
            </span>
            <span className={`text-xs font-semibold ${
              scrolled ? 'text-foreground' : 'text-white'
            }`}>
              2026
            </span>
          </div> */}
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-all duration-300 hover:text-primary group ${
                scrolled ? "text-foreground/80" : "text-white/80"
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <Button 
            asChild 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)] transition-transform active:scale-95"
          >
            <a href="#register">Register Now</a>
          </Button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="relative z-[110] md:hidden p-2 -mr-2 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="text-foreground" size={28} />
          ) : (
            <Menu className={scrolled ? "text-foreground" : "text-white"} size={28} />
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100] md:hidden"
              />
              
              {/* Menu Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] bg-background border-l border-border z-[105] p-8 pt-24 md:hidden shadow-2xl"
              >
                <div className="flex flex-col gap-6">
                  {navLinks.map((link, idx) => (
                    <motion.a
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="pt-4"
                  >
                    <Button asChild size="lg" className="w-full">
                      <a href="#register">Register Now</a>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;