import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Brain, Utensils, Dumbbell, Calendar, MessageSquare, Bot, User, LoaderCircle } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';

const messageSchema = z.object({
  content: z.string().min(1, 'Please enter a message'),
});

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

// Example nutrition analysis response
const nutritionAnalysisExample = {
  meals: [
    {
      name: 'Breakfast',
      calories: 450,
      nutrients: {
        protein: 22,
        carbs: 60,
        fat: 15,
      },
      improvements: [
        'Consider adding more protein to keep you fuller longer',
        'Try reducing sugar content by using natural sweeteners',
      ],
    },
    {
      name: 'Lunch',
      calories: 620,
      nutrients: {
        protein: 35,
        carbs: 70,
        fat: 20,
      },
      improvements: [
        'Good protein content, but high in sodium',
        'Try adding more vegetables for fiber and micronutrients',
      ],
    },
  ],
  suggestions: [
    'Your protein intake is good but consider spacing it more evenly throughout the day',
    'Try to include more fiber-rich foods to reach your daily goal',
    'Consider reducing processed foods to lower sodium intake',
  ],
};

// Example fitness recommendation
const workoutRecommendationExample = {
  type: 'Strength Training',
  duration: '45 minutes',
  exercises: [
    {
      name: 'Squats',
      sets: 3,
      reps: 12,
      notes: 'Focus on form and depth',
    },
    {
      name: 'Push-ups',
      sets: 3,
      reps: 15,
      notes: 'Modify with knees if needed',
    },
    {
      name: 'Dumbbell Rows',
      sets: 3,
      reps: 12,
      notes: 'Use appropriate weight',
    },
  ],
  tips: 'Rest 60-90 seconds between sets. Stay hydrated throughout.',
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your health assistant. How can I help you today? You can ask me about nutrition, workout suggestions, meal planning, or general health advice.",
      timestamp: new Date(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('chat');
  const [nutritionData, setNutritionData] = useState<any>(nutritionAnalysisExample);
  const [workoutData, setWorkoutData] = useState<any>(workoutRecommendationExample);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [isTabLoading, setIsTabLoading] = useState(false);

  useEffect(() => {
    if (currentTab === 'nutrition') {
      fetchNutritionAnalysis();
    } else if (currentTab === 'fitness') {
      fetchWorkoutRecommendations();
    } else if (currentTab === 'insights') {
      fetchHealthInsights();
    }
  }, [currentTab]);

  async function fetchNutritionAnalysis() {
    setIsTabLoading(true);
    try {
      const response = await fetch('/api/ai/nutritional-analysis');
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition analysis');
      }
      const data = await response.json();
      setNutritionData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch nutrition analysis.',
        variant: 'destructive',
      });
    } finally {
      setIsTabLoading(false);
    }
  }

  async function fetchWorkoutRecommendations() {
    setIsTabLoading(true);
    try {
      const response = await fetch('/api/ai/workout-recommendations');
      if (!response.ok) {
        throw new Error('Failed to fetch workout recommendations');
      }
      const data = await response.json();
      setWorkoutData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch workout recommendations.',
        variant: 'destructive',
      });
    } finally {
      setIsTabLoading(false);
    }
  }

  async function fetchHealthInsights() {
    setIsTabLoading(true);
    try {
      const response = await fetch('/api/ai/health-insights');
      if (!response.ok) {
        throw new Error('Failed to fetch health insights');
      }
      const data = await response.json();
      setInsightsData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch health insights.',
        variant: 'destructive',
      });
    } finally {
      setIsTabLoading(false);
    }
  }
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: '',
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function onSubmit(data: z.infer<typeof messageSchema>) {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: data.content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    form.reset();
    
    // Start loading
    setIsLoading(true);
    
    try {
      // Send to the API endpoint
      const response = await fetch('/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: data.content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const result = await response.json();
      
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date(result.timestamp),
      };
      
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get a response from the AI assistant.',
        variant: 'destructive',
      });
      
      // Add a fallback error message
      const errorResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Health AI Assistant</h1>
          
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-4">
            <TabsList className="grid w-full md:w-auto md:inline-flex grid-cols-4">
              <TabsTrigger value="chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Utensils className="h-4 w-4 mr-2" />
                Nutrition
              </TabsTrigger>
              <TabsTrigger value="fitness">
                <Dumbbell className="h-4 w-4 mr-2" />
                Fitness
              </TabsTrigger>
              <TabsTrigger value="insights">
                <Brain className="h-4 w-4 mr-2" />
                Insights
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Bot className="h-5 w-5 mr-2 text-primary" />
                    Chat with Health Assistant
                  </CardTitle>
                  <CardDescription>
                    Ask about nutrition, workouts, meal planning, or get health advice
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 h-[400px] overflow-y-auto pr-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div className="flex space-x-2 max-w-[80%]">
                          {message.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                AI
                              </AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.content}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          
                          {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex space-x-2 max-w-[80%]">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              AI
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="rounded-lg px-4 py-2 bg-muted flex items-center space-x-2">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <CardFooter>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full flex space-x-2"
                    >
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Type your message..."
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isLoading}>
                        Send
                      </Button>
                    </form>
                  </Form>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="nutrition" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Nutrition Analysis</CardTitle>
                  <CardDescription>
                    AI insights based on your recent meal entries
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {nutritionAnalysisExample.meals.map((meal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{meal.name}</h3>
                          <span className="text-sm font-medium">{meal.calories} calories</span>
                        </div>
                        
                        <div className="flex gap-4">
                          <div className="bg-blue-100 dark:bg-blue-900/30 rounded px-2 py-1 text-xs">
                            Protein: {meal.nutrients.protein}g
                          </div>
                          <div className="bg-green-100 dark:bg-green-900/30 rounded px-2 py-1 text-xs">
                            Carbs: {meal.nutrients.carbs}g
                          </div>
                          <div className="bg-red-100 dark:bg-red-900/30 rounded px-2 py-1 text-xs">
                            Fat: {meal.nutrients.fat}g
                          </div>
                        </div>
                        
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          {meal.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                        
                        {index < nutritionAnalysisExample.meals.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg mt-4">
                    <h3 className="font-medium mb-2">Suggestions for Improvement</h3>
                    <ul className="space-y-2">
                      {nutritionAnalysisExample.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">▹</span>
                          <span className="text-sm">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentTab('chat')}>
                    Chat for More Personalized Advice
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="fitness" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Workout Recommendations</CardTitle>
                  <CardDescription>
                    Personalized exercise plan based on your fitness goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium">Today's Recommended Workout</h3>
                      <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {workoutRecommendationExample.type}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Duration: {workoutRecommendationExample.duration}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-4">
                    {workoutRecommendationExample.exercises.map((exercise, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{exercise.name}</h4>
                          <span className="text-xs bg-background px-2 py-0.5 rounded">
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {exercise.notes}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-1 text-blue-700 dark:text-blue-300">Workout Tips</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {workoutRecommendationExample.tips}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button className="w-full" onClick={() => toast({ title: "Workout added to calendar!" })}>
                    Add to Calendar
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setCurrentTab('chat')}>
                    Request Modifications
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Health Insights</CardTitle>
                  <CardDescription>
                    AI-powered analysis of your health data trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-medium">Weekly Progress Summary</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Average Calories</p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">2,150</p>
                        <p className="text-xs text-green-600 dark:text-green-400">-50 from goal</p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Active Days</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">4/7</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">+1 from last week</p>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Water Intake</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">1.8L</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">65% of goal</p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h3 className="font-medium">Pattern Analysis</h3>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium">Nutrition Patterns</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your protein intake is higher on workout days. Consider maintaining this level on rest days as well for better muscle recovery.
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium">Sleep Quality</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Your sleep quality improves on days with morning workouts. Consider adjusting your exercise schedule to favor mornings.
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium">Mood Correlation</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Higher vegetable intake correlates with improved mood scores in your tracking data. Aim for 5+ servings daily.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => toast({ title: "Report downloaded!" })}>
                    Download Full Report
                  </Button>
                  <Button onClick={() => setCurrentTab('chat')}>
                    Discuss Insights
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}