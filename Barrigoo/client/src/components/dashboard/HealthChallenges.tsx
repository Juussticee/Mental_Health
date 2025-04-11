import { useState } from "react";
import { Button } from "@/components/ui/button";

type Challenge = {
  id: number;
  title: string;
  description: string;
  current: number;
  target: number;
  bgColor: string;
  icon: React.ReactNode;
}

export default function HealthChallenges() {
  // In a real app, this would come from API/context
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: "7 Day Protein Challenge",
      description: "Reach your daily protein goals for 7 consecutive days",
      current: 3,
      target: 7,
      bgColor: "bg-gradient-to-br from-blue-500 to-indigo-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 -mr-6 -mt-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 2,
      title: "Sugar Detox Week",
      description: "Stay under 25g of added sugar each day for a week",
      current: 4,
      target: 7,
      bgColor: "bg-gradient-to-br from-green-500 to-teal-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 -mr-6 -mt-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: "Hydration Quest",
      description: "Drink 2L of water daily for 10 consecutive days",
      current: 6,
      target: 10,
      bgColor: "bg-gradient-to-br from-purple-500 to-pink-600",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 -mr-6 -mt-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ]);
  
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-4">Health Challenges</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <div 
            key={challenge.id} 
            className={`${challenge.bgColor} p-5 rounded-xl shadow-sm text-white relative overflow-hidden`}
          >
            <div className="absolute right-0 top-0 opacity-10">
              {challenge.icon}
            </div>
            
            <h4 className="font-bold text-xl mb-2">{challenge.title}</h4>
            <p className="text-sm opacity-80 mb-4">{challenge.description}</p>
            
            <div className="flex space-x-1 mb-3">
              {Array.from({ length: challenge.target }).map((_, index) => (
                <div 
                  key={index}
                  className={`w-${challenge.target > 7 ? '4' : '6'} h-1.5 rounded-full bg-white ${index < challenge.current ? '' : 'opacity-30'}`}
                ></div>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium">{challenge.current} of {challenge.target} days</span>
              <Button size="sm" variant="outline" className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full border-0">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
