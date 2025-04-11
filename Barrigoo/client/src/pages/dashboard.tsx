import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import CalorieProgress from "@/components/dashboard/CalorieProgress";
import DailyGoals from "@/components/dashboard/DailyGoals";
import NutritionTrends from "@/components/dashboard/NutritionTrends";
import MealSummary from "@/components/dashboard/MealSummary";
import HealthChallenges from "@/components/dashboard/HealthChallenges";
import AddMealModal from "@/components/dashboard/modals/AddMealModal";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header 
          onAddMealClick={() => setShowAddMealModal(true)} 
        />
        
        <div className="p-6">
          {/* Calorie Counter Section (Yazio-style) */}
          <div className="flex justify-center mb-8">
            <CalorieProgress />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <DailyGoals />
            <NutritionTrends />
            <MealSummary />
          </div>
          
          <HealthChallenges />
        </div>
      </div>
      
      {showAddMealModal && (
        <AddMealModal onClose={() => setShowAddMealModal(false)} />
      )}
    </div>
  );
}
