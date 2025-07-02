// src/components/SignUp.tsx
import { signUp, confirmSignUp, signIn } from 'aws-amplify/auth';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Mail, Lock, Shield, ArrowRight, CheckCircle } from "lucide-react";

 const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'register' | 'confirm'>('register');
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    };
  };

  const onRegister = async () => {
    setError(undefined);
    setSuccess(undefined);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Password does not meet requirements');
      return;
    }

    setIsLoading(true);
    try {
      await signUp({ 
        username: email, 
        password, 
        options: {
          userAttributes: {
            email
          }
        }
      });
      setStage('confirm');
      setSuccess('Account created! Please check your email for the confirmation code.');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const onConfirm = async () => {
    setError(undefined);
    setSuccess(undefined);
    setIsLoading(true);
    
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setSuccess('Account confirmed successfully!');
      
      // Auto sign-in after confirmation
      try {
        await signIn({ username: email, password });
        setSuccess('Account confirmed and signed in successfully!');
        // Here you would typically redirect to the main app
      } catch (signInErr: any) {
        setError('Account confirmed but sign-in failed: ' + signInErr.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
          </div>
          <CardTitle className="text-xl">
            {stage === 'register' ? 'Create Your Account' : 'Confirm Your Account'}
          </CardTitle>
          <CardDescription>
            {stage === 'register' 
              ? 'Join PhiloAI to explore philosophical wisdom' 
              : 'Enter the confirmation code sent to your email'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {stage === 'register' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                
                {/* Password requirements */}
                <div className="text-xs space-y-1">
                  <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    One number
                  </div>
                  <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    One special character
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                onClick={onRegister} 
                className="w-full" 
                disabled={isLoading || !email || !password || !confirmPassword}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmation Code</label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              <Button 
                onClick={onConfirm} 
                className="w-full" 
                disabled={isLoading || !code}
              >
                {isLoading ? 'Confirming...' : 'Confirm Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                onClick={() => setStage('register')} 
                className="w-full"
                disabled={isLoading}
              >
                Back to Registration
              </Button>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/signin" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUp;
