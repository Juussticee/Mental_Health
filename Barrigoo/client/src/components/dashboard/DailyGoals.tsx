import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type GoalProps = {
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  completed?: boolean;
}

export default function DailyGoals() {
  // In a real app, this would come from API/context
  const [goals, setGoals] = useState<GoalProps[]>([
    { 
      name: "Drink water (2L)", 
      current: 3, 
      target: 8, 
      unit: "glasses", 
      color: "bg-blue-500" 
    },
    { 
      name: "Eat vegetables (300g)", 
      current: 150, 
      target: 300, 
      unit: "g", 
      color: "bg-green-500" 
    },
    { 
      name: "Limit sugar (25g)", 
      current: 18, 
      target: 25, 
      unit: "g", 
      color: "bg-red-500" 
    },
    { 
      name: "No junk food", 
      current: 1, 
      target: 1, 
      unit: "", 
      color: "bg-green-500",
      completed: true
    }
  ]);

  return (
    <Card className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Daily Goals</h3>
        <a href="#" className="text-primary text-sm hover:underline">View Calendar</a>
      </div>
      
      {goals.map((goal, index) => (
        <div key={index} className="mb-4 last:mb-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">{goal.name}</span>
            {goal.completed ? (
              <span className="text-xs text-green-500">Completed</span>
            ) : (
              <span className="text-xs text-gray-500">
                {goal.current}/{goal.target} {goal.unit}
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full">
            <div 
              className={`h-full ${goal.color} rounded-full`} 
              style={{ 
                width: `${Math.min((goal.current / goal.target) * 100, 100)}%` 
              }}
            ></div>
          </div>
        </div>
      ))}
    </Card>
  );
}
