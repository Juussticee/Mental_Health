import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/Sidebar";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  PlusCircle, Search, Utensils, Carrot, Coffee, Pizza 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { format, isSameDay, addDays, startOfWeek, addWeeks, endOfWeek, isToday } from "date-fns";

// Type definitions
type MealEntry = {
  id: number;
  name: string;
  type: string;
  time: string;
  calories: number;
  date: Date;
};

type NutritionSummary = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: number;
};

const mealTypeIcons: Record<string, React.ReactNode> = {
  Breakfast: <Coffee className="h-4 w-4 mr-2" />,
  Lunch: <Utensils className="h-4 w-4 mr-2" />,
  Dinner: <Utensils className="h-4 w-4 mr-2" />,
  Snack: <Carrot className="h-4 w-4 mr-2" />,
  Other: <Pizza className="h-4 w-4 mr-2" />
};

// Mock data function
const getMockMeals = (): MealEntry[] => [
  {
    id: 1,
    name: "Avocado Toast",
    type: "Breakfast",
    time: "8:30 AM",
    calories: 320,
    date: new Date()
  },
  {
    id: 2,
    name: "Grilled Chicken Salad",
    type: "Lunch",
    time: "12:45 PM",
    calories: 410,
    date: new Date()
  },
  {
    id: 3,
    name: "Protein Smoothie",
    type: "Snack",
    time: "4:00 PM",
    calories: 220,
    date: new Date()
  },
  {
    id: 4,
    name: "Salmon with Vegetables",
    type: "Dinner",
    time: "7:30 PM",
    calories: 520,
    date: new Date()
  },
  {
    id: 5,
    name: "Yogurt with Berries",
    type: "Breakfast",
    time: "8:15 AM",
    calories: 210,
    date: addDays(new Date(), -1)
  },
  {
    id: 6,
    name: "Turkey Sandwich",
    type: "Lunch",
    time: "1:00 PM",
    calories: 380,
    date: addDays(new Date(), -1)
  }
];

// Calculate nutrition summary for a specific date
const calculateNutritionSummary = (meals: MealEntry[], date: Date): NutritionSummary => {
  const dayMeals = meals.filter(meal => isSameDay(meal.date, date));
  
  return {
    calories: dayMeals.reduce((sum, meal) => sum + meal.calories, 0),
    protein: 75, // Mock data
    carbs: 180,  // Mock data
    fat: 55,     // Mock data
    meals: dayMeals.length
  };
};

// Calendar Day Cell Component
const CalendarDay = ({ 
  day, 
  meals, 
  selectedDate, 
  onDateClick 
}: { 
  day: Date; 
  meals: MealEntry[];
  selectedDate: Date;
  onDateClick: (date: Date) => void;
}) => {
  const dayMeals = meals.filter(meal => isSameDay(meal.date, day));
  const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const isSelected = isSameDay(day, selectedDate);
  const isCurrentDay = isToday(day);
  
  return (
    <div 
      className={`
        p-1 border rounded-md cursor-pointer transition-colors
        ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}
        ${isCurrentDay ? 'border-primary' : 'border-gray-200'}
      `}
      onClick={() => onDateClick(day)}
    >
      <div className="text-center mb-1">
        <div className={`text-xs uppercase ${isCurrentDay ? 'font-bold text-primary' : 'text-gray-500'}`}>
          {format(day, 'EEE')}
        </div>
        <div className={`text-sm ${isCurrentDay ? 'font-bold' : ''}`}>
          {format(day, 'd')}
        </div>
      </div>
      {dayMeals.length > 0 ? (
        <div className="text-center text-xs font-medium">
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
            {totalCalories} cal
          </Badge>
        </div>
      ) : (
        <div className="text-center text-xs text-gray-400">No meals</div>
      )}
    </div>
  );
};

// Meal List Item Component
const MealListItem = ({ meal }: { meal: MealEntry }) => (
  <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
      <div>
        <div className="font-medium text-sm">{meal.name}</div>
        <div className="text-xs text-gray-500 flex items-center mt-1">
          {mealTypeIcons[meal.type] || <Utensils className="h-3 w-3 mr-1" />}
          {meal.type} • {meal.time}
        </div>
      </div>
    </div>
    <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
      {meal.calories} cal
    </Badge>
  </div>
);

// Weekly Calendar View
const WeeklyView = ({ 
  currentDate, 
  meals, 
  onWeekChange, 
  onDateClick, 
  selectedDate 
}: { 
  currentDate: Date; 
  meals: MealEntry[];
  onWeekChange: (date: Date) => void;
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}) => {
  // Calculate week start and end
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="font-medium">
          {format(weekStart, "MMMM yyyy")}
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onWeekChange(addWeeks(currentDate, -1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onWeekChange(new Date())}
          >
            Today
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onWeekChange(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map((day) => (
          <CalendarDay 
            key={day.toString()} 
            day={day} 
            meals={meals}
            selectedDate={selectedDate}
            onDateClick={onDateClick}
          />
        ))}
      </div>
    </div>
  );
};

// Monthly Calendar View Component
const MonthlyView = ({ 
  currentDate, 
  onDateClick, 
  selectedDate 
}: { 
  currentDate: Date;
  onDateClick: (date: Date) => void;
  selectedDate: Date;
}) => {
  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateClick(date)}
        className="rounded-md border"
        disabled={{ before: new Date(2000, 0, 1) }}
      />
    </div>
  );
};

// Daily Summary Component
const DailySummary = ({ summary }: { summary: NutritionSummary }) => (
  <div className="grid grid-cols-4 gap-4 mb-6">
    <Card className="flex flex-col items-center justify-center p-4 text-center">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-xs text-gray-500">Calories</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold">{summary.calories}</div>
        <div className="text-xs text-gray-500">kcal</div>
      </CardContent>
    </Card>
    
    <Card className="flex flex-col items-center justify-center p-4 text-center">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-xs text-gray-500">Protein</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold">{summary.protein}</div>
        <div className="text-xs text-gray-500">g</div>
      </CardContent>
    </Card>
    
    <Card className="flex flex-col items-center justify-center p-4 text-center">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-xs text-gray-500">Carbs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold">{summary.carbs}</div>
        <div className="text-xs text-gray-500">g</div>
      </CardContent>
    </Card>
    
    <Card className="flex flex-col items-center justify-center p-4 text-center">
      <CardHeader className="p-0 pb-2">
        <CardTitle className="text-xs text-gray-500">Fat</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xl font-bold">{summary.fat}</div>
        <div className="text-xs text-gray-500">g</div>
      </CardContent>
    </Card>
  </div>
);

// Day's Meals Component
const DayMeals = ({ 
  date, 
  meals, 
  onAddMeal 
}: { 
  date: Date; 
  meals: MealEntry[];
  onAddMeal: () => void;
}) => {
  const dayMeals = meals.filter(meal => isSameDay(meal.date, date));
  const mealsByType: Record<string, MealEntry[]> = {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: []
  };
  
  dayMeals.forEach(meal => {
    if (mealsByType[meal.type]) {
      mealsByType[meal.type].push(meal);
    } else {
      mealsByType.Other = mealsByType.Other || [];
      mealsByType.Other.push(meal);
    }
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">
          {isToday(date) ? "Today's Meals" : `Meals for ${format(date, 'MMMM d, yyyy')}`}
        </h3>
        <Button size="sm" onClick={onAddMeal}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Meal
        </Button>
      </div>
      
      {dayMeals.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No meals recorded for this day</p>
          <Button variant="outline" size="sm" onClick={onAddMeal}>
            Add Your First Meal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(mealsByType).map(([type, meals]) => 
            meals.length > 0 && (
              <div key={type}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">{type}</h4>
                <div className="space-y-2">
                  {meals.map(meal => (
                    <MealListItem key={meal.id} meal={meal} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

// Main Calendar Page Component
export default function CalendarPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<'week' | 'month'>('week');
  const [showAddMeal, setShowAddMeal] = useState(false);
  
  // In a real app, these would come from an API call
  const meals = getMockMeals();
  const nutritionSummary = calculateNutritionSummary(meals, selectedDate);
  
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Nutrition Calendar</h1>
            
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span>{format(selectedDate, 'PP')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select
                value={viewType}
                onValueChange={(value) => setViewType(value as 'week' | 'month')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  {viewType === 'week' ? (
                    <WeeklyView 
                      currentDate={currentDate}
                      meals={meals}
                      onWeekChange={setCurrentDate}
                      onDateClick={handleDateChange}
                      selectedDate={selectedDate}
                    />
                  ) : (
                    <MonthlyView 
                      currentDate={currentDate}
                      onDateClick={handleDateChange}
                      selectedDate={selectedDate}
                    />
                  )}
                </CardContent>
              </Card>
              
              <div className="mt-6">
                <DailySummary summary={nutritionSummary} />
              </div>
            </div>
            
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Summary</CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <DayMeals 
                      date={selectedDate} 
                      meals={meals}
                      onAddMeal={() => setShowAddMeal(true)}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}