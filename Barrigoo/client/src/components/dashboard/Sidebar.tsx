import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Home, 
  Utensils, 
  Calendar, 
  Settings, 
  Award, 
  Activity, 
  MessageSquare, 
  LogOut,
  ChevronRight,
  Users
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        if (user) {
          const res = await apiRequest("GET", "/api/admin/check");
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
      }
    };
    
    checkAdminStatus();
  }, [user]);
  
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      },
    });
  };
  
  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Meals", path: "/meals", icon: <Utensils className="h-5 w-5" /> },
    { name: "Calendar", path: "/calendar", icon: <Calendar className="h-5 w-5" /> },
    { name: "Habits", path: "/habits", icon: <Activity className="h-5 w-5" /> },
    { name: "AI Assistant", path: "/ai-assistant", icon: <MessageSquare className="h-5 w-5" /> },
    { name: "Goals", path: "/goals", icon: <Award className="h-5 w-5" /> },
    { name: "Settings", path: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];
  
  // Add admin route if user is admin
  if (isAdmin) {
    navItems.splice(6, 0, { 
      name: "Admin", 
      path: "/admin", 
      icon: <Users className="h-5 w-5" /> 
    });
  }
  
  return (
    <aside className="bg-white border-r border-gray-200 w-16 md:w-64 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-200 flex items-center justify-center md:justify-start">
        <div className="bg-primary rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
          H
        </div>
        <h1 className="ml-2 text-xl font-bold hidden md:block">HealthTrackr</h1>
      </div>
      
      <nav className="flex-1 py-4 flex flex-col space-y-1">
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className={`flex items-center px-4 py-3 text-sm mx-2 rounded-md ${
              location === item.path 
                ? "bg-primary/10 text-primary" 
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className="ml-3 hidden md:block">{item.name}</span>
            {location === item.path && (
              <ChevronRight className="ml-auto hidden md:block h-4 w-4" />
            )}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          <div className="ml-3 hidden md:block">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto p-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}