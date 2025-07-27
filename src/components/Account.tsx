import React, { useRef, useState } from 'react';
import { useAuthenticated, useUserProfile, useRefreshUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, ChevronLeft, User, Mail, Settings, NavigationOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '@aws-amplify/auth';
import { useQueryClient } from '@tanstack/react-query';

const Account = () => {
    const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuthenticated();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const [isLoading, setIsLoading] = useState(false);
  const {refreshUserData} = useRefreshUserData();
  const queryClient = useQueryClient();
  if (authLoading || profileLoading) {
    return <div>Loading...</div>;
  }

  /*if (!isAuthenticated || isLoading) {
    navigate('/auth=signin');
    return null;
  }*/

  const onSignOut = async () => {
    setIsLoading(true);

    try {
      await signOut();
      queryClient.setQueryData(['currentUser'], null);
      queryClient.setQueryData(['userProfile'], null);
      navigate('/')

    }
    catch(err:any){
      console.log(err.message);
    }
    finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <ChevronLeft className="h-6 w-6 text-primary hover:text-primary/80" />
              <span className="text-sm text-muted-foreground">Back</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">PhiloAI</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Account Content */}
      <div className="container mx-auto px-4 py-8 mt-[100px]">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-6 w-6" />
                <span>My Account</span>
              </CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Display Name</p>
                        <p className="text-sm text-muted-foreground">
                          {userProfile.displayName || 'Not set'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-muted-foreground">
                          {userProfile.preferences?.theme || 'light'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Account created: {new Date(userProfile.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}

              <div className="flex space-x-4 pt-4">
                <Button variant="outline" onClick={() => navigate('/')}>
                  Back to Home
                </Button>
                <Button variant="destructive" onClick={onSignOut}>
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default Account;