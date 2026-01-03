import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to secure your infrastructure?
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          Join thousands of companies protecting their digital assets with SecureCore.
        </p>
        <Button variant="hero" size="xl" asChild>
          <Link to="/register">
            Subscribe now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
