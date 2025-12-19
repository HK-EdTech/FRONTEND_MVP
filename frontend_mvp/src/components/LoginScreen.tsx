import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Chrome, Apple, FileText, BarChart3, Users } from 'lucide-react';

interface SignUpData {
  firstName: string;
  surname: string;
  username: string;
  classLevel: string;
}

interface LoginScreenProps {
  onLogin: (email: string, password: string, isSignUp: boolean, signUpData?: SignUpData) => Promise<void>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isSignUp && (!firstName || !surname || !username || !classLevel)) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const signUpData = isSignUp ? {
        firstName,
        surname,
        username,
        classLevel
      } : undefined;

      await onLogin(email, password, isSignUp, signUpData);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background illustration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and features */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl text-gray-900">ATS Resume Analyzer</h1>
            </div>
            <p className="text-xl text-gray-600">
              Streamline your hiring process with intelligent resume analysis
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg text-gray-900">Advanced Analytics</h3>
                <p className="text-gray-600">Get detailed insights into resume quality and ATS compatibility scores</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg text-gray-900">Bulk Processing</h3>
                <p className="text-gray-600">Upload and analyze multiple resumes simultaneously for efficient screening</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg text-gray-900">Smart Recommendations</h3>
                <p className="text-gray-600">Receive actionable feedback to improve resume quality and matching</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center transition-all duration-300">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-center transition-all duration-300">
                {isSignUp
                  ? 'Sign up to start analyzing resumes'
                  : 'Sign in to your ATS dashboard'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div
                  className={`space-y-4 transition-all duration-500 ease-in-out overflow-hidden ${
                    isSignUp
                      ? 'max-h-[500px] opacity-100 translate-y-0'
                      : 'max-h-0 opacity-0 -translate-y-4'
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surname">Surname</Label>
                      <Input
                        id="surname"
                        type="text"
                        placeholder="Enter surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required={isSignUp}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classLevel">Class Level</Label>
                    <Select value={classLevel} onValueChange={setClassLevel} required={isSignUp}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your class level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Primary 1">Primary 1</SelectItem>
                        <SelectItem value="Primary 2">Primary 2</SelectItem>
                        <SelectItem value="Primary 3">Primary 3</SelectItem>
                        <SelectItem value="Primary 4">Primary 4</SelectItem>
                        <SelectItem value="Primary 5">Primary 5</SelectItem>
                        <SelectItem value="Primary 6">Primary 6</SelectItem>
                        <SelectItem value="Secondary 1">Secondary 1</SelectItem>
                        <SelectItem value="Secondary 2">Secondary 2</SelectItem>
                        <SelectItem value="Secondary 3">Secondary 3</SelectItem>
                        <SelectItem value="Secondary 4">Secondary 4</SelectItem>
                        <SelectItem value="Secondary 5">Secondary 5</SelectItem>
                        <SelectItem value="Secondary 6">Secondary 6</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isSignUp
                      ? 'max-h-32 opacity-100 translate-y-0'
                      : 'max-h-0 opacity-0 -translate-y-4'
                  }`}
                >
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isSignUp}
                    />
                  </div>
                </div>
                {error && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                </Button>
              </form>

              {process.env.NEXT_PUBLIC_IS_MVP !== 'false' && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Chrome className="w-4 h-4 mr-2" />
                      Google
                    </Button>
                    <Button variant="outline" className="w-full border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Apple className="w-4 h-4 mr-2" />
                      Apple
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center text-sm">
                {isSignUp ? (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(false)}
                      className="text-blue-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(true)}
                      className="text-blue-600 hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}