import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, CreditCard, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const plans = [
  { id: 'free-trial', name: 'Free Trial', price: '$0', period: '14 days' },
  { id: 'small', name: 'Small Companies', price: '$44', period: '/month' },
  { id: 'enterprise', name: 'Enterprise', price: '$124', period: '/month' },
];

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialPlan = searchParams.get('plan') || 'free-trial';
  
  const [step, setStep] = useState<'signup' | 'payment'>('signup');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSignupNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    
    if (signupData.password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }
    
    setStep('payment');
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment info
    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryMonth || 
        !paymentData.expiryYear || !paymentData.cvv) {
      toast({ title: 'Error', description: 'Please fill in all payment fields', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    // Simulated registration - submit both signup AND payment together
    setTimeout(() => {
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('isAuthenticated', 'true');
      toast({ 
        title: 'Account created!', 
        description: 'Welcome to SecureCore. Redirecting to dashboard...' 
      });
      navigate('/dashboard');
      setIsLoading(false);
    }, 1500);
  };

  const selectedPlanData = plans.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </Link>
          <CardTitle className="text-2xl">
            {step === 'signup' ? 'Create your account' : 'Payment Information'}
          </CardTitle>
          <CardDescription>
            {step === 'signup' 
              ? `Start with ${selectedPlanData?.name} - ${selectedPlanData?.price}${selectedPlanData?.period}` 
              : 'Complete your registration with payment details'}
          </CardDescription>
          
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`flex items-center gap-2 ${step === 'signup' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'signup' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {step === 'payment' ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm">Account</span>
            </div>
            <div className="w-8 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="text-sm">Payment</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {step === 'signup' ? (
            <form onSubmit={handleSignupNext} className="space-y-4">
              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Selected Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.price}{plan.period}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@company.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={signupData.phone}
                  onChange={handleSignupChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Your company"
                  value={signupData.company}
                  onChange={handleSignupChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Continue to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmitAll} className="space-y-4">
              {/* Payment Summary */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{selectedPlanData?.name}</p>
                    <p className="text-sm text-muted-foreground">Billed {selectedPlanData?.id === 'free-trial' ? 'after 14 days' : 'monthly'}</p>
                  </div>
                  <p className="text-xl font-bold">{selectedPlanData?.price}<span className="text-sm font-normal text-muted-foreground">{selectedPlanData?.period}</span></p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  placeholder="John Doe"
                  value={paymentData.cardName}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Month</Label>
                  <Select value={paymentData.expiryMonth} onValueChange={(value) => setPaymentData({ ...paymentData, expiryMonth: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="MM" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                          {String(i + 1).padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Year</Label>
                  <Select value={paymentData.expiryYear} onValueChange={(value) => setPaymentData({ ...paymentData, expiryYear: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="YY" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={String(year).slice(-2)}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    name="cvv"
                    placeholder="123"
                    maxLength={4}
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Billing Address</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  placeholder="123 Main St"
                  value={paymentData.billingAddress}
                  onChange={handlePaymentChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="San Francisco"
                    value={paymentData.city}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="94102"
                    value={paymentData.zipCode}
                    onChange={handlePaymentChange}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep('signup')} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Complete Registration'}
                </Button>
              </div>
            </form>
          )}
          
          <p className="mt-4 text-xs text-muted-foreground text-center">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
