import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NutritionTrends() {
  const [timespan, setTimespan] = useState<'week' | 'month'>('week');
  
  // In a real app, this data would come from API/context
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    calories: [2100, 1950, 2050, 1800, 2200, 1900, 1750],
    protein: [110, 95, 105, 100, 115, 90, 85]
  };
  
  const monthlyData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    calories: [1900, 2000, 1850, 1950],
    protein: [98, 100, 90, 95]
  };
  
  const currentData = timespan === 'week' ? weeklyData : monthlyData;
  
  // Normalize data for display in the SVG chart
  const maxCalories = Math.max(...currentData.calories);
  const maxProtein = Math.max(...currentData.protein);
  const dataPoints = currentData.labels.length;
  const chartWidth = 300;
  const chartHeight = 150;
  const padding = 30;
  const availableWidth = chartWidth - padding * 2;
  const availableHeight = chartHeight - padding * 2;
  
  const caloriesPath = currentData.calories.map((value, index) => {
    const x = padding + (index * (availableWidth / (dataPoints - 1)));
    const y = chartHeight - padding - (value / maxCalories * availableHeight);
    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  
  const proteinPath = currentData.protein.map((value, index) => {
    const x = padding + (index * (availableWidth / (dataPoints - 1)));
    const y = chartHeight - padding - (value / maxProtein * availableHeight);
    return `${index === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  
  return (
    <Card className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Nutrition Trends</h3>
        <div className="flex space-x-2">
          <Button 
            variant={timespan === 'week' ? 'default' : 'outline'} 
            size="sm"
            className={timespan === 'week' ? 'bg-blue-50 text-primary hover:bg-blue-100 hover:text-primary' : ''}
            onClick={() => setTimespan('week')}
          >
            Week
          </Button>
          <Button 
            variant={timespan === 'month' ? 'default' : 'outline'} 
            size="sm"
            className={timespan === 'month' ? 'bg-blue-50 text-primary hover:bg-blue-100 hover:text-primary' : ''}
            onClick={() => setTimespan('month')}
          >
            Month
          </Button>
        </div>
      </div>
      
      <div className="h-52 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full">
            {/* Grid Lines */}
            {[30, 60, 90, 120].map((y) => (
              <line 
                key={y} 
                x1="0" 
                y1={y} 
                x2={chartWidth} 
                y2={y} 
                stroke="#f3f4f6" 
                strokeWidth="1"
              />
            ))}
            
            {/* X-axis labels */}
            {currentData.labels.map((label, index) => {
              const x = padding + (index * (availableWidth / (dataPoints - 1)));
              return (
                <text
                  key={index}
                  x={x}
                  y={chartHeight - 5}
                  fontSize="8"
                  textAnchor="middle"
                  fill="#9ca3af"
                >
                  {label}
                </text>
              );
            })}
            
            {/* Calories Line */}
            <path 
              d={caloriesPath}
              fill="none" 
              stroke="#3498db" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Protein Line */}
            <path 
              d={proteinPath}
              fill="none" 
              stroke="#2ecc71" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            
            {/* Data Points - Calories */}
            {currentData.calories.map((value, index) => {
              const x = padding + (index * (availableWidth / (dataPoints - 1)));
              const y = chartHeight - padding - (value / maxCalories * availableHeight);
              return (
                <circle 
                  key={`cal-${index}`} 
                  cx={x} 
                  cy={y} 
                  r="3" 
                  fill="#3498db"
                />
              );
            })}
            
            {/* Data Points - Protein */}
            {currentData.protein.map((value, index) => {
              const x = padding + (index * (availableWidth / (dataPoints - 1)));
              const y = chartHeight - padding - (value / maxProtein * availableHeight);
              return (
                <circle 
                  key={`prot-${index}`} 
                  cx={x} 
                  cy={y} 
                  r="3" 
                  fill="#2ecc71"
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      <div className="flex justify-center mt-2 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span className="text-xs text-gray-600">Calories</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
          <span className="text-xs text-gray-600">Protein</span>
        </div>
      </div>
    </Card>
  );
}
