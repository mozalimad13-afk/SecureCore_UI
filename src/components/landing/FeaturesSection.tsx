import { Shield, Zap, BarChart3, Bell, Lock, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Shield,
    title: 'Real-time Detection',
    description: 'Continuously monitor network traffic with advanced ML models to detect threats instantly.',
  },
  {
    icon: Zap,
    title: 'Automated Response',
    description: 'Automatically block malicious traffic and alert your team when threats are detected.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive dashboards and reports to understand your security posture.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Configurable alert thresholds and notifications via email, SMS, or webhooks.',
  },
  {
    icon: Lock,
    title: 'IP Management',
    description: 'Easily manage blocklists and whitelists to control network access.',
  },
  {
    icon: Globe,
    title: 'Cross-Platform',
    description: 'Deploy on Windows, Linux, or any cloud infrastructure with ease.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{' '}
            <span className="text-gradient">Network Security</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive IDS solution provides all the tools you need to protect your infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
