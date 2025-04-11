import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Extended schema with validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  email: z.string().email("Please enter a valid email address"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [accountNotFound, setAccountNotFound] = useState(false);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Check for successful login
  if (user) {
    return <Redirect to="/" />;
  }

  function onLoginSubmit(values: LoginValues) {
    setLoginError(null);
    loginMutation.mutate(values, {
      onError: (error) => {
        setLoginError(error.message);
        if (error.message.includes("Invalid username or password")) {
          setAccountNotFound(true);
        }
      }
    });
  }

  function onRegisterSubmit(values: RegisterValues) {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData, {
      onError: (error) => {
        // Display the specific error from the server
        // Username already exists or Email already in use will be shown
        registerForm.setError("username", { 
          message: error.message === "Username already exists" ? error.message : undefined 
        });
        registerForm.setError("email", { 
          message: error.message === "Email already in use" ? error.message : undefined 
        });
      }
    });
  }

  function handleSocialLogin(provider: string) {
    // This would connect to the OAuth provider
    alert(`${provider} login not implemented yet`);
  }

  // Password strength indicator
  function getPasswordStrength(password: string) {
    if (!password) return { strength: 0, label: "Poor", color: "bg-red-500" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthMap = [
      { strength: 0, label: "Poor", color: "bg-red-500" },
      { strength: 1, label: "Poor", color: "bg-red-500" },
      { strength: 2, label: "Weak", color: "bg-orange-500" },
      { strength: 3, label: "Good", color: "bg-yellow-500" },
      { strength: 4, label: "Strong", color: "bg-green-500" },
      { strength: 5, label: "Very Strong", color: "bg-green-600" }
    ];
    
    return strengthMap[strength];
  }

  const registerPassword = registerForm.watch("password");
  const passwordStrength = getPasswordStrength(registerPassword);

  return (
    <div className="flex min-h-screen">
      {/* Left column - Auth forms */}
      <div className="w-full lg:w-1/2 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">HealthTrackr</CardTitle>
            <CardDescription className="text-center">
              Login or create an account to start tracking your health journey
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent>
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                {accountNotFound && (
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <AlertDescription>
                      Account not found. Would you like to 
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-1"
                        onClick={() => setActiveTab("register")}
                      >
                        create an account
                      </Button>?
                    </AlertDescription>
                  </Alert>
                )}
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Login
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSocialLogin('Google')}
                    >
                      <FaGoogle className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSocialLogin('GitHub')}
                    >
                      <FaGithub className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          
                          {/* Password strength indicator */}
                          {field.value && (
                            <div className="mt-1 space-y-1">
                              <div className="flex h-1 w-full space-x-1">
                                <div className={`h-full w-1/4 rounded-full ${passwordStrength.strength >= 1 ? passwordStrength.color : 'bg-gray-200'}`}></div>
                                <div className={`h-full w-1/4 rounded-full ${passwordStrength.strength >= 2 ? passwordStrength.color : 'bg-gray-200'}`}></div>
                                <div className={`h-full w-1/4 rounded-full ${passwordStrength.strength >= 3 ? passwordStrength.color : 'bg-gray-200'}`}></div>
                                <div className={`h-full w-1/4 rounded-full ${passwordStrength.strength >= 4 ? passwordStrength.color : 'bg-gray-200'}`}></div>
                              </div>
                              <p className="text-xs text-gray-500">
                                Password strength: <span className={`font-medium ${passwordStrength.color === 'bg-red-500' ? 'text-red-500' : passwordStrength.color === 'bg-orange-500' ? 'text-orange-500' : passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-500'}`}>{passwordStrength.label}</span>
                              </p>
                            </div>
                          )}
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Register
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSocialLogin('Google')}
                    >
                      <FaGoogle className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleSocialLogin('GitHub')}
                    >
                      <FaGithub className="mr-2 h-4 w-4" />
                      GitHub
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter>
            <p className="text-xs text-center text-gray-500 mt-4 w-full">
              By continuing, you agree to HealthTrackr's Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right column - Hero section */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600">
        <div className="h-full flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Track Your Health Journey</h1>
          <p className="text-lg mb-8">
            HealthTrackr helps you monitor your nutrition, set healthy goals, and develop better food habits for a healthier lifestyle.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">Track Your Nutrition</h3>
                <p className="text-blue-100">Monitor calories, macros, and meal habits with our intuitive dashboard</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">Set Health Goals</h3>
                <p className="text-blue-100">Create personalized goals for hydration, nutrition, and better eating habits</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-semibold">AI-Powered Assistance</h3>
                <p className="text-blue-100">Get smart recipe suggestions and meal planning assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
