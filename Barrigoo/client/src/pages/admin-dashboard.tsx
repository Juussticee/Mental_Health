import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, apiRequest } from "@/lib/queryClient";
import { Loader2, Users, Utensils, Calendar, TimerIcon, Settings, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation } from "wouter";

// Type definitions
type User = {
  id: number;
  username: string;
  email: string;
  joinedDate: string;
  lastActive: string;
  mealCount: number;
  habitCount: number;
  calorieAverage: number;
};

type Analytics = {
  userStats: {
    total: number;
    activeThisMonth: number;
    newThisMonth: number;
    retentionRate: number;
  };
  nutritionStats: {
    mealLogsTotal: number;
    avgMealsPerUser: number;
    popularIngredients: Array<{ name: string; count: number }>;
    popularCookingMethods: Array<{ name: string; count: number }>;
  };
  habitStats: {
    totalHabits: number;
    avgHabitsPerUser: number;
    completionRate: number;
    popularHabitTypes: Array<{ type: string; count: number }>;
  };
  systemStats: {
    apiRequests: number;
    avgResponseTime: number;
    errorRate: number;
    peakHour: number;
  };
};

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await apiRequest("GET", "/api/admin/check");
        const data = await res.json();
        setIsAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin dashboard.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify admin privileges.",
          variant: "destructive",
        });
        navigate("/");
      }
    };
    
    checkAdminStatus();
  }, [navigate, toast]);
  
  // Fetch users for admin dashboard
  const { 
    data: users = [], 
    isLoading: isLoadingUsers 
  } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isAdmin === true,
  });
  
  // Fetch analytics for admin dashboard
  const { 
    data: analytics, 
    isLoading: isLoadingAnalytics 
  } = useQuery<Analytics>({
    queryKey: ['/api/admin/analytics'],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: isAdmin === true,
  });
  
  if (isAdmin === null || isAdmin === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Alert className="max-w-md">
          <Info className="h-5 w-5" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            The admin dashboard is only accessible to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isLoadingUsers || isLoadingAnalytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">Welcome back, {user?.username}. Here's what's happening with HealthTrackr.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Admin Settings
            </Button>
          </div>
          
          {/* Summary Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{analytics.userStats.total}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.userStats.newThisMonth} new this month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Meal Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Utensils className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{analytics.nutritionStats.mealLogsTotal}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Avg. {analytics.nutritionStats.avgMealsPerUser} per user
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Habits Created</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{analytics.habitStats.totalHabits}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.habitStats.completionRate}% completion rate
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <TimerIcon className="h-5 w-5 text-primary mr-2" />
                    <div className="text-2xl font-bold">{analytics.systemStats.avgResponseTime}ms</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.systemStats.apiRequests.toLocaleString()} API requests
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Main Content Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts and their activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Last Active</TableHead>
                          <TableHead>Meals</TableHead>
                          <TableHead>Habits</TableHead>
                          <TableHead>Avg. Calories</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(user.lastActive).toLocaleDateString()}</TableCell>
                            <TableCell>{user.mealCount}</TableCell>
                            <TableCell>{user.habitCount}</TableCell>
                            <TableCell>{user.calorieAverage}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              
              {analytics && (
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>
                      Monthly user growth and retention metrics.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Jan', Total: 123, Active: 98 },
                            { name: 'Feb', Total: 135, Active: 105 },
                            { name: 'Mar', Total: 156, Active: 118 },
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="Total" fill="#0088FE" />
                          <Bar dataKey="Active" fill="#00C49F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-4">
              {analytics && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Popular Ingredients</CardTitle>
                        <CardDescription>
                          Most frequently used ingredients across all users.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={analytics.nutritionStats.popularIngredients}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {analytics.nutritionStats.popularIngredients.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Cooking Methods</CardTitle>
                        <CardDescription>
                          Most popular cooking methods used in meal logs.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analytics.nutritionStats.popularCookingMethods}
                              layout="vertical"
                              margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="habits" className="space-y-4">
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Habit Type Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of different habit types tracked by users.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analytics.habitStats.popularHabitTypes}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                              nameKey="type"
                              label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                            >
                              {analytics.habitStats.popularHabitTypes.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Habit Completion Metrics</CardTitle>
                      <CardDescription>
                        Statistics on habit completion and adherence.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium">Average Habits Per User</div>
                            <div className="text-sm font-medium">{analytics.habitStats.avgHabitsPerUser}</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(analytics.habitStats.avgHabitsPerUser / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium">Completion Rate</div>
                            <div className="text-sm font-medium">{analytics.habitStats.completionRate}%</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${analytics.habitStats.completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-sm font-medium">User Retention Rate</div>
                            <div className="text-sm font-medium">{analytics.userStats.retentionRate}%</div>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${analytics.userStats.retentionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}