import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";

type HeaderProps = {
  onAddMealClick: () => void;
};

export default function Header({ onAddMealClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm p-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
      
      <div className="flex items-center space-x-4">
        <Link href="/meals">
          <Button 
            className="bg-primary text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Meal
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          size="sm"
          className="border border-gray-300 text-gray-700"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Today
        </Button>
        
        <Link href="/ai-assistant">
          <Button 
            className="bg-secondary text-white"
            size="sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Assistant
          </Button>
        </Link>
      </div>
    </header>
  );
}
