import { useState } from "react";

type NutrientIndicatorProps = {
  current: number;
  target: number;
  label: string;
  color: string;
}

const NutrientIndicator = ({ current, target, label, color }: NutrientIndicatorProps) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  return (
    <div className="text-center">
      <div className="flex items-end justify-center">
        <span className="text-lg font-semibold text-gray-800">{current}g</span>
        <span className="text-xs text-gray-500 mb-0.5 ml-0.5">/{target}g</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
        <div 
          className={`h-full ${color} rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function CalorieProgress() {
  // In a real app, this would come from API/context
  const [calorieData, setCalorieData] = useState({
    current: 1265,
    target: 2000,
    nutrients: [
      { id: 1, label: "Protein", current: 65, target: 120, color: "bg-blue-500" },
      { id: 2, label: "Fat", current: 42, target: 70, color: "bg-yellow-500" },
      { id: 3, label: "Carbs", current: 135, target: 250, color: "bg-purple-500" }
    ]
  });
  
  const caloriesRemaining = calorieData.target - calorieData.current;
  const progressPercentage = Math.min((calorieData.current / calorieData.target) * 100, 100);
  
  return (
    <div className="flex flex-col items-center">
      {/* Completely redesigned circular progress */}
      <div className="relative mb-6 mt-4">
        <div className="w-48 h-48 relative">
          {/* Background circle */}
          <div className="w-full h-full rounded-full bg-gray-100"></div>
          
          {/* Progress circle */}
          <div 
            className="absolute top-0 left-0 w-full h-full rounded-full bg-blue-500" 
            style={{ 
              clipPath: `polygon(50% 50%, 50% 0%, ${progressPercentage < 25 
                ? `${50 + 50 * Math.tan(progressPercentage / 100 * 2 * Math.PI)}% 0%` 
                : progressPercentage < 50 
                  ? "100% 0%, 100% " + (50 - 50 * Math.tan((0.5 - progressPercentage / 100) * 2 * Math.PI)) + "%" 
                  : progressPercentage < 75 
                    ? "100% 0%, 100% 100%, " + (50 + 50 * Math.tan((0.75 - progressPercentage / 100) * 2 * Math.PI)) + "% 100%" 
                    : "100% 0%, 100% 100%, 0% 100%, 0% " + (50 + 50 * Math.tan((1 - progressPercentage / 100) * 2 * Math.PI)) + "%"
              })` 
            }}
          ></div>
          
          {/* Inner white circle for cutout effect */}
          <div className="absolute top-[15%] left-[15%] w-[70%] h-[70%] rounded-full bg-white flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">Calories</p>
              <div className="flex items-end justify-center">
                <span className="text-2xl font-bold text-gray-800">{calorieData.current.toLocaleString()}</span>
                <span className="text-xs text-gray-500 mb-1 ml-1">/{calorieData.target.toLocaleString()}</span>
              </div>
              <p className="text-xs text-green-500 font-medium">{caloriesRemaining} remaining</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Nutrient indicators */}
      <div className="flex space-x-8 mt-2">
        {calorieData.nutrients.map(nutrient => (
          <NutrientIndicator
            key={nutrient.id}
            current={nutrient.current}
            target={nutrient.target}
            label={nutrient.label}
            color={nutrient.color}
          />
        ))}
      </div>
    </div>
  );
}
