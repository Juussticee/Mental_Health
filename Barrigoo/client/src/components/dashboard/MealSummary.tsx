import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Meal = {
  id: number;
  time: string;
  name: string;
  calories: number;
  items: {
    name: string;
    quantity: string;
  }[];
  icon: React.ReactNode;
}

export default function MealSummary() {
  // In a real app, this would come from API/context
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: 1,
      time: "8:30 AM",
      name: "Breakfast",
      calories: 320,
      items: [
        { name: "Oatmeal with banana", quantity: "250g" },
        { name: "Black coffee", quantity: "240ml" }
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 2,
      time: "12:45 PM",
      name: "Lunch",
      calories: 520,
      items: [
        { name: "Grilled chicken salad", quantity: "350g" },
        { name: "Whole grain bread", quantity: "1 slice" }
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      time: "7:30 PM",
      name: "Dinner",
      calories: 425,
      items: [
        { name: "Salmon with vegetables", quantity: "300g" },
        { name: "Brown rice", quantity: "150g" }
      ],
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    }
  ]);
  
  return (
    <Card className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Today's Meals</h3>
        <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50 hover:text-primary">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      
      {meals.map((meal) => (
        <div key={meal.id} className="mb-4 last:mb-0">
          <div className="flex items-center mb-2">
            {meal.icon}
            <h4 className="text-sm font-medium text-gray-700">{meal.name} ({meal.time})</h4>
            <span className="text-xs text-gray-500 ml-auto">{meal.calories} kcal</span>
          </div>
          
          <div className="pl-6 space-y-2">
            {meal.items.map((item, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="text-gray-400 text-xs ml-auto">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </Card>
  );
}
