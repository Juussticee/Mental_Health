import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/Sidebar";
import { 
  Loader2, Search, Plus, AlertCircle, MoreVertical, Calendar, ChevronLeft, ChevronRight, 
  ArrowUp, ArrowDown, CheckCircle2, Utensils, BarChart3, Timer, Clock, Pencil, Trash2,
  Pause, Play
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

// Habit type definition
type Habit = {
  id: number;
  name: string;
  description: string;
  type: string;
  frequency: string;
  timeOfDay?: string;
  streakDays: number;
  createdAt: string;
  status: "active" | "completed" | "paused";
};

// Habit suggestion cards data
const habitSuggestions = [
  {
    title: "Drink Water",
    description: "Stay hydrated by drinking at least 8 glasses a day",
    icon: <ArrowDown className="h-4 w-4 mr-2" />,
    type: "nutrition"
  },
  {
    title: "Eat Vegetables",
    description: "Include at least 3 servings of vegetables in your daily meals",
    icon: <Utensils className="h-4 w-4 mr-2" />,
    type: "nutrition"
  },
  {
    title: "No Late Snacking",
    description: "Avoid eating after 8:00 PM",
    icon: <Clock className="h-4 w-4 mr-2" />,
    type: "nutrition"
  },
  {
    title: "Portion Control",
    description: "Use smaller plates to manage portion sizes",
    icon: <BarChart3 className="h-4 w-4 mr-2" />,
    type: "nutrition"
  },
  {
    title: "Meal Planning",
    description: "Plan your meals for the week in advance",
    icon: <Calendar className="h-4 w-4 mr-2" />,
    type: "planning"
  }
];

const habitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  type: z.string().min(1, "Type is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timeOfDay: z.string().optional(),
  reminders: z.boolean().default(false)
});

type HabitFormValues = z.infer<typeof habitSchema>;

// Habit Item Component
const HabitItem = ({ habit, onEdit, onDelete }: { habit: Habit, onEdit: (habit: Habit) => void, onDelete: (id: number) => void }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge 
              className={`mb-2 ${
                habit.type === "nutrition" 
                ? "bg-green-100 text-green-800" 
                : "bg-blue-100 text-blue-800"
              }`}
            >
              {habit.type}
            </Badge>
            <CardTitle className="text-lg flex items-center">
              {habit.name}
              {habit.streakDays > 0 && (
                <Badge variant="outline" className="ml-2 flex items-center">
                  <Timer className="h-3 w-3 mr-1" />
                  {habit.streakDays} day streak
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{habit.description}</CardDescription>
          </div>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(habit)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(habit.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Stats
                </DropdownMenuItem>
                {habit.status === "active" ? (
                  <DropdownMenuItem>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Habit
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Habit
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {habit.frequency} • {habit.timeOfDay || "Anytime"}
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="flex items-center text-green-600"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Complete Today
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Add Habit Form Component
const AddHabitForm = ({ onClose }: { onClose: () => void }) => {
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "nutrition",
      frequency: "daily",
      timeOfDay: "anytime",
      reminders: false
    }
  });

  const onSubmit = (values: HabitFormValues) => {
    console.log("Form submitted:", values);
    // Here you would normally save the habit via API
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Habit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink more water" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Drink 8 glasses of water daily" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="nutrition">Nutrition</SelectItem>
                    <SelectItem value="hydration">Hydration</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekdays">Weekdays</SelectItem>
                    <SelectItem value="weekends">Weekends</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="timeOfDay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time of Day</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="anytime">Anytime</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reminders"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Enable Reminders</FormLabel>
                <FormDescription>
                  Get notifications to help you stay on track
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Habit</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Habit Suggestions Component
const HabitSuggestions = ({ onSelect }: { onSelect: (habit: any) => void }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Popular Habits</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habitSuggestions.map((habit, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => onSelect(habit)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-sm flex items-center">
                {habit.icon}
                {habit.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {habit.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main Food Habits Page Component
export default function HabitsPage() {
  const { user } = useAuth();
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isEditHabitOpen, setIsEditHabitOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null);
  const [habitsList, setHabitsList] = useState<Habit[]>([
    {
      id: 1,
      name: "Eat More Vegetables",
      description: "Include at least 3 servings of vegetables every day",
      type: "nutrition",
      frequency: "daily",
      timeOfDay: "Lunch & Dinner",
      streakDays: 5,
      createdAt: "2023-04-01",
      status: "active"
    },
    {
      id: 2,
      name: "Drink Water",
      description: "Drink at least 2 liters of water daily",
      type: "nutrition",
      frequency: "daily",
      timeOfDay: "Throughout Day",
      streakDays: 12,
      createdAt: "2023-03-15",
      status: "active"
    },
    {
      id: 3,
      name: "Plan Weekly Meals",
      description: "Plan all meals for the week every Sunday",
      type: "planning",
      frequency: "weekly",
      timeOfDay: "Sunday Evening",
      streakDays: 3,
      createdAt: "2023-04-10",
      status: "active"
    }
  ]);
  
  const filteredHabits = habitsList.filter(habit => {
    if (activeTab === "active") return habit.status === "active";
    if (activeTab === "completed") return habit.status === "completed";
    return habit.status === "paused";
  });
  
  const handleEditHabit = (habit: Habit) => {
    setCurrentHabit(habit);
    setIsEditHabitOpen(true);
  };
  
  const handleDeleteHabit = (id: number) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      setHabitsList(habitsList.filter(habit => habit.id !== id));
    }
  };
  
  const handleHabitSuggestionSelect = (suggestion: any) => {
    // This would pre-fill the add habit form with the suggestion
    console.log("Selected suggestion:", suggestion);
    setIsAddHabitOpen(true);
    // In a real implementation, we would set the form values here
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Food Habits</h1>
            
            <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create a New Food Habit</DialogTitle>
                </DialogHeader>
                <AddHabitForm onClose={() => setIsAddHabitOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="paused">Paused</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="space-y-4">
              {filteredHabits.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <p className="text-gray-500 mb-4">No active habits yet</p>
                  <Button onClick={() => setIsAddHabitOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    {filteredHabits.map(habit => (
                      <HabitItem 
                        key={habit.id} 
                        habit={habit} 
                        onEdit={handleEditHabit}
                        onDelete={handleDeleteHabit}
                      />
                    ))}
                  </div>
                  
                  <Separator className="my-8" />
                  
                  <HabitSuggestions onSelect={handleHabitSuggestionSelect} />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-gray-500">No completed habits yet</p>
              </div>
            </TabsContent>
            
            <TabsContent value="paused">
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-gray-500">No paused habits yet</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}