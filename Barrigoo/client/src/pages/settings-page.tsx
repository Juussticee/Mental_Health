import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import Sidebar from '@/components/dashboard/Sidebar';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accentColor: z.enum(['blue', 'green', 'red', 'purple', 'orange', 'teal']),
  calorieGoal: z.number().min(500).max(10000),
  proteinGoal: z.number().min(10).max(500),
  carbsGoal: z.number().min(10).max(500),
  fatGoal: z.number().min(10).max(500),
  measurementUnit: z.enum(['metric', 'imperial']),
  notifications: z.boolean(),
  language: z.enum(['english', 'spanish', 'french', 'german']),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');

  // Fetch user settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    },
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (values: Partial<SettingsFormValues>) => {
      const res = await apiRequest('PUT', '/api/settings', values);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Settings updated',
        description: 'Your settings have been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Form setup
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      theme: 'light',
      accentColor: 'blue',
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      measurementUnit: 'metric',
      notifications: true,
      language: 'english',
    },
  });

  // Update form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  function onSubmit(values: SettingsFormValues) {
    updateSettingsMutation.mutate(values);
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Settings</h1>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-3 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="nutritional">Nutritional Goals</TabsTrigger>
                <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <TabsContent value="general">
                    <Card>
                      <CardHeader>
                        <CardTitle>General Settings</CardTitle>
                        <CardDescription>
                          Customize the appearance and behavior of the application.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Theme</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="light">Light</SelectItem>
                                  <SelectItem value="dark">Dark</SelectItem>
                                  <SelectItem value="system">System</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accent Color</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select accent color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="blue" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                                    <span>Blue</span>
                                  </SelectItem>
                                  <SelectItem value="green" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-green-500" />
                                    <span>Green</span>
                                  </SelectItem>
                                  <SelectItem value="red" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-red-500" />
                                    <span>Red</span>
                                  </SelectItem>
                                  <SelectItem value="purple" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-purple-500" />
                                    <span>Purple</span>
                                  </SelectItem>
                                  <SelectItem value="orange" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-orange-500" />
                                    <span>Orange</span>
                                  </SelectItem>
                                  <SelectItem value="teal" className="flex items-center gap-2">
                                    <div className="h-4 w-4 rounded-full bg-teal-500" />
                                    <span>Teal</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="measurementUnit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Measurement Unit</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="metric">Metric (g, kg, cm)</SelectItem>
                                  <SelectItem value="imperial">Imperial (oz, lb, in)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Language</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select language" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="english">English</SelectItem>
                                  <SelectItem value="spanish">Spanish</SelectItem>
                                  <SelectItem value="french">French</SelectItem>
                                  <SelectItem value="german">German</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Notifications</FormLabel>
                                <CardDescription>Receive reminders and updates</CardDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="nutritional">
                    <Card>
                      <CardHeader>
                        <CardTitle>Nutritional Goals</CardTitle>
                        <CardDescription>
                          Set your daily nutritional targets to track your progress.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        <FormField
                          control={form.control}
                          name="calorieGoal"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between">
                                <FormLabel>Daily Calorie Goal</FormLabel>
                                <span className="font-medium">{field.value} kcal</span>
                              </div>
                              <FormControl>
                                <Slider
                                  value={[field.value]}
                                  min={500}
                                  max={5000}
                                  step={50}
                                  onValueChange={(value) => field.onChange(value[0])}
                                  className="py-4"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-6">
                          <h3 className="font-medium text-sm text-muted-foreground">Macronutrient Goals</h3>
                          
                          <FormField
                            control={form.control}
                            name="proteinGoal"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between">
                                  <FormLabel>Protein Goal</FormLabel>
                                  <span className="font-medium">{field.value} g</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    value={[field.value]}
                                    min={10}
                                    max={300}
                                    step={5}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="carbsGoal"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between">
                                  <FormLabel>Carbohydrate Goal</FormLabel>
                                  <span className="font-medium">{field.value} g</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    value={[field.value]}
                                    min={10}
                                    max={500}
                                    step={5}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="fatGoal"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex justify-between">
                                  <FormLabel>Fat Goal</FormLabel>
                                  <span className="font-medium">{field.value} g</span>
                                </div>
                                <FormControl>
                                  <Slider
                                    value={[field.value]}
                                    min={10}
                                    max={200}
                                    step={5}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="privacy">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy & Data</CardTitle>
                        <CardDescription>
                          Manage your data and privacy settings.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="font-medium">Data Export</h3>
                          <p className="text-sm text-muted-foreground">
                            Download all your health tracking data in a standard format.
                          </p>
                          <Button variant="outline" type="button">
                            Export Data
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h3 className="font-medium">Delete Account</h3>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data.
                          </p>
                          <Button variant="destructive" type="button">
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => form.reset(settings)}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={updateSettingsMutation.isPending || !form.formState.isDirty}
                    >
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}