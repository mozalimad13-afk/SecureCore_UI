import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star } from 'lucide-react';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '14 days',
    description: 'Try SecureCore risk-free',
    features: [
      'Basic threat detection',
      'Up to 100 alerts/day',
      'Email notifications',
      'Community support',
    ],
    cta: 'Start Free Trial',
    href: '/register',
    popular: false,
  },
  {
    name: 'Small Companies',
    price: '$44',
    period: '/mo',
    description: 'Perfect for small teams getting started',
    features: [
      'Basic threat detection',
      'Weekly security reports',
      'Standard integrations',
      'Email support',
      '1,000 alerts/day',
    ],
    cta: 'Subscribe Now',
    href: '/register',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$199',
    period: '/mo',
    description: 'For organizations with advanced needs',
    features: [
      'Advanced ML detection',
      'Real-time reporting',
      'Custom integrations',
      'Priority support',
      'Unlimited alerts',
      'Custom rules engine',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    popular: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent{' '}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your security needs. All plans include core features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                  : 'border-border/50 hover:border-primary/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    <Star className="w-3 h-3" />
                    Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-lg font-medium text-muted-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Button 
                  variant={plan.popular ? 'hero' : 'outline'} 
                  className="w-full" 
                  asChild
                >
                  <Link to={plan.href}>{plan.cta}</Link>
                </Button>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium">What's Included:</p>
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
