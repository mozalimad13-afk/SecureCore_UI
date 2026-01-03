import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Documentation', 'API'],
  Resources: ['Blog', 'Community', 'Support', 'Status'],
  Company: ['About', 'Careers', 'Partners', 'Contact'],
  Legal: ['Privacy', 'Terms', 'Security', 'Compliance'],
};

export function Footer() {
  return (
    <footer className="py-16 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-6 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">SecureCore</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Advanced cybersecurity platform for modern enterprises.
            </p>
          </div>
          
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <Link 
                      to="#" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-border/50 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 SecureCore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
