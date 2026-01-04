import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const footerLinks = {
  Product: [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Documentation', href: '#' },
    { name: 'API', href: '#' },
  ],
  Resources: [
    { name: 'Blog', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Support', href: '#' },
    { name: 'Status', href: '#' },
  ],
  Company: [
    { name: 'About', href: '/#about' },
    { name: 'Careers', href: '#' },
    { name: 'Partners', href: '#' },
    { name: 'Contact', href: '/contact' },
  ],
  Legal: [
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '#' },
    { name: 'Security', href: '#' },
    { name: 'Compliance', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer id="about" className="py-16 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-6 gap-8 mb-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">SecureCore</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              Advanced cybersecurity platform for modern enterprises. Protecting businesses worldwide since 2020.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📍 San Francisco, CA 94105</p>
              <p>📧 support@securecore.com</p>
              <p>📞 +1 (555) 123-4567</p>
            </div>
          </div>
          
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
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
