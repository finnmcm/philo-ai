// src/components/SignUp.tsx
import { signUp, confirmSignUp, signIn, getCurrentUser, signOut } from 'aws-amplify/auth';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Mail, Lock, Shield, ArrowRight, CheckCircle, ChevronLeft } from "lucide-react";
import { saveUserProfile } from "@/components/api/userStorage";

   const Auth = () => {
  const navigate = useNavigate();
  
  const goOnAuth = () => {
    navigate('/chat');
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'register'  | 'confirm'>('register');
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const { signin } = useParams<{ signin?: string }>();

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
  const onSignIn = async () => {
    setError(undefined);
    setSuccess(undefined);
    setIsLoading(true);

    try {
      // Check if user is already authenticated
      try {
        const currentUser = await getCurrentUser();
        console.log('User already authenticated:', currentUser);
        setSuccess('Already signed in!');
        return;
      } catch (authErr: any) {
        // User is not authenticated, proceed with sign in
        console.log('User not authenticated, signing in...');
      }

      await signIn({
        username: email,
        password: password
      });
      setSuccess('Successfully logged in!');
      goOnAuth();
    }
    catch(err:any){
      setError(err.message || 'Failed to sign in');
    }
    finally {
      setIsLoading(false);
    }
  }
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
      // First, confirm the sign-up
      await confirmSignUp({ username: email, confirmationCode: code });
      setSuccess('Account confirmed successfully!');
      
      // Check if user is already authenticated after confirmation
      let currentUser;
      try {
        currentUser = await getCurrentUser();
        console.log('User already authenticated:', currentUser);
      } catch (authErr: any) {
        // User is not authenticated, so sign them in
        console.log('User not authenticated, signing in...');
        await signIn({ username: email, password });
        currentUser = await getCurrentUser();
        setSuccess('Account confirmed and signed in successfully!');
      }
      
      // Now save the user profile
      try {
        await saveUserProfile({
          email: email,
          createdAt: new Date().toISOString(),
          preferences: {
            theme: 'light',
            notifications: true,
            language: 'en'
          }
        });
        setSuccess('Account confirmed, signed in, and profile created successfully!');
        // Here you would typically redirect to the main app
      } catch (profileErr: any) {
        console.error('Error saving user profile:', profileErr);
        setError(`Signed in but profile creation failed: ${profileErr.message || profileErr.name || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error during confirmation:', err);
      setError(err.message || 'Failed to confirm account');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      <header className="bg-transparent backdrop-blur-sm ">
        <div className="container mx-auto px-4 py-4 =">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <ChevronLeft className="h-6 w-6 text-primary hover:text-primary/80 mt-[30px]" />
              <span className="text-sm text-muted-foreground mt-[30px]">Back</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex items-center justify-center p-4 flex-1 mt-[100px]">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
          </div>
          <CardTitle className="text-xl">
            {signin === "signin=false" ? 
            (stage === 'register' ? 'Create Your Account' : 'Confirm Your Account')
            : ('Sign In')
          }
            
          </CardTitle>
          <CardDescription>
            {signin === "signin=false" ? 
            (stage === 'register' 
              ? 'Join PhiloAI to explore philosophical wisdom' 
              : 'Enter the confirmation code sent to your email') : 
              
              "Discover your next breakthrough"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {signin === "signin=false" ? (
            stage === 'register' ? (
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
            )
          ) : (
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
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                onClick={onSignIn} 
                className="w-full" 
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
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
            {signin === "signin=false" ? (
              <>
                Already have an account?{' '}
                <a href="/auth/signin=true" className="text-primary hover:underline">
                  Sign in
                </a>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <a href="/auth/signin=false" className="text-primary hover:underline">
                  Sign up
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default Auth;
