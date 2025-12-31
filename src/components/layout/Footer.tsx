import { Link } from 'react-router-dom';
import { Heart, Instagram, Mail } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Names */}
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-foreground">Eddie</span>
            <Heart className="w-5 h-5 text-primary animate-float" />
            <span className="font-display text-3xl text-foreground">Yasmine</span>
          </div>

          {/* Date */}
          <p className="text-muted-foreground font-serif text-lg">
            July 2nd, 2027
          </p>

          {/* Decorative Line */}
          <div className="decorative-line w-32" />

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/our-story" className="text-muted-foreground hover:text-primary transition-colors">
              Our Story
            </Link>
            <Link to="/event-details" className="text-muted-foreground hover:text-primary transition-colors">
              Event Details
            </Link>
            <Link to="/rsvp" className="text-muted-foreground hover:text-primary transition-colors">
              RSVP
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="mailto:wedding@eddieyasmine.com"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            © 2027 Eddie & Yasmine • Made with love
          </p>
        </div>
      </div>
    </footer>
  );
};
