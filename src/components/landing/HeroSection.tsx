import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NetworkSphere } from '@/components/NetworkSphere';
import { Shield, Zap, ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <NetworkSphere />
      
      <div className="container mx-auto px-4 pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Security</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Enterprise-grade{' '}
              <span className="text-gradient">Cybersecurity</span>{' '}
              Made Simple
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Protect, monitor, and ensure compliance across your entire infrastructure with AI-powered 
              threat detection and automated response.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary" />
                </div>
                <span>Real-time intrusion detection</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary" />
                </div>
                <span>Automated threat response</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                  <Shield className="w-3 h-3 text-primary" />
                </div>
                <span>ML-powered anomaly detection</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
            
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Trusted by leading enterprises</p>
              <div className="flex gap-8 items-center opacity-60">
                <span className="font-semibold">TechCorp</span>
                <span className="font-semibold">DataFlow</span>
                <span className="font-semibold">SecureNet</span>
                <span className="font-semibold">CloudGuard</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            {/* 3D visualization is in the background */}
          </div>
        </div>
      </div>
    </section>
  );
}
