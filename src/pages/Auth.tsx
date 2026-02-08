import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const { login, signup, resetPassword, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Navigate to home when successfully authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
      } else {
        await signup(formData.name, formData.email, formData.password);
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: isLogin ? "Login failed" : "Sign up failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset password.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await resetPassword(formData.email);
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen nature-gradient-soft flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl nature-gradient mb-4 animate-float">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">GreenAI</h1>
        <p className="text-muted-foreground">AI-powered Plant Recognition</p>
      </div>

      {/* Form Card */}
      <div className="flex-1 bg-card rounded-t-[2.5rem] px-6 py-8 card-shadow">
        <div className="max-w-sm mx-auto">
          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? 'bg-card text-foreground card-shadow' : 'text-muted-foreground'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? 'bg-card text-foreground card-shadow' : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jackson"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 h-12 rounded-xl"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl nature-gradient text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </Button>
            
            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-sm text-primary hover:underline mt-2"
              >
                Forgot password?
              </button>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
