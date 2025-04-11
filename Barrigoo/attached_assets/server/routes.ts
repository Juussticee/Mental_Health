import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

// Middleware to check authentication
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
};

// Middleware to check admin status
const isAdmin = async (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  
  try {
    const settings = await storage.getUserSettings(req.user!.id);
    if (!settings || !settings.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify admin status" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Meals API endpoints
  app.get("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const meals = await storage.getUserMeals(req.user!.id);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  });

  app.post("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const newMeal = await storage.createUserMeal(req.user!.id, req.body);
      res.status(201).json(newMeal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create meal" });
    }
  });

  app.put("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const updatedMeal = await storage.updateUserMeal(req.user!.id, mealId, req.body);
      res.json(updatedMeal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update meal" });
    }
  });

  app.delete("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const success = await storage.deleteUserMeal(req.user!.id, mealId);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(404).json({ error: "Meal not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal" });
    }
  });

  // Ingredients and cooking methods API endpoints
  app.get("/api/ingredients", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string | undefined;
      const ingredients = await storage.getIngredients(query);
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.get("/api/cooking-methods", isAuthenticated, async (req, res) => {
    try {
      const cookingMethods = await storage.getCookingMethods();
      res.json(cookingMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cooking methods" });
    }
  });

  // Pre-made meals API endpoints
  app.get("/api/premade-meals", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q as string | undefined;
      const meals = await storage.getPremadeMeals(query);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pre-made meals" });
    }
  });

  app.get("/api/premade-meals/:id", isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const meal = await storage.getPremadeMealById(mealId);
      if (meal) {
        res.json(meal);
      } else {
        res.status(404).json({ error: "Pre-made meal not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pre-made meal" });
    }
  });

  // Nutrition calculation API endpoint
  app.post("/api/calculate-nutrition", isAuthenticated, async (req, res) => {
    try {
      const nutrition = await storage.calculateMealNutrition(req.body.ingredients);
      res.json(nutrition);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate nutrition" });
    }
  });

  // User settings API endpoints
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user!.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateUserSettings(req.user!.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Goals and challenges API endpoints
  app.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getUserGoals(req.user!.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/challenges", isAuthenticated, async (req, res) => {
    try {
      const challenges = await storage.getUserChallenges(req.user!.id);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });
  
  // Habits API endpoints
  app.get("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const habits = await storage.getUserHabits(req.user!.id);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });
  
  app.post("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const newHabit = await storage.createUserHabit(req.user!.id, req.body);
      res.status(201).json(newHabit);
    } catch (error) {
      res.status(500).json({ error: "Failed to create habit" });
    }
  });
  
  app.put("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const updatedHabit = await storage.updateUserHabit(req.user!.id, habitId, req.body);
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update habit" });
    }
  });
  
  app.delete("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const success = await storage.deleteUserHabit(req.user!.id, habitId);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(404).json({ error: "Habit not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });

  // User preferences API endpoint
  app.put("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUserPreferences(
        req.user!.id, 
        req.body.preferences
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });
  
  // Admin API endpoints
  app.get("/api/admin/check", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user!.id);
      const isAdmin = settings && settings.isAdmin === true;
      res.json({ isAdmin });
    } catch (error) {
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });
  
  // Admin-only endpoints
  
  // Get all users for admin dashboard
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      // In a real implementation, we would fetch actual user data from the database
      // For now, we'll return simulated user data
      res.json([
        {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          joinedDate: "2023-01-01T00:00:00.000Z",
          lastActive: "2023-03-28T10:30:00.000Z",
          mealCount: 45,
          habitCount: 5,
          calorieAverage: 2150
        },
        {
          id: 2,
          username: "jane_smith",
          email: "jane@example.com",
          joinedDate: "2023-01-15T00:00:00.000Z",
          lastActive: "2023-03-27T14:20:00.000Z",
          mealCount: 32,
          habitCount: 3,
          calorieAverage: 1950
        },
        {
          id: 3,
          username: "john_doe",
          email: "john@example.com",
          joinedDate: "2023-02-05T00:00:00.000Z",
          lastActive: "2023-03-25T09:45:00.000Z",
          mealCount: 18,
          habitCount: 2,
          calorieAverage: 2340
        }
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Get app analytics for admin dashboard
  app.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
      // In a real implementation, we would calculate actual analytics
      // For now, we'll return simulated analytics data
      res.json({
        userStats: {
          total: 156,
          activeThisMonth: 98,
          newThisMonth: 23,
          retentionRate: 78
        },
        nutritionStats: {
          mealLogsTotal: 4532,
          avgMealsPerUser: 29,
          popularIngredients: [
            { name: "Chicken Breast", count: 1245 },
            { name: "Brown Rice", count: 987 },
            { name: "Broccoli", count: 856 },
            { name: "Egg", count: 725 },
            { name: "Salmon", count: 654 }
          ],
          popularCookingMethods: [
            { name: "Grilled", count: 1657 },
            { name: "Baked", count: 1243 },
            { name: "Steamed", count: 987 },
            { name: "Roasted", count: 876 },
            { name: "Raw", count: 765 }
          ]
        },
        habitStats: {
          totalHabits: 642,
          avgHabitsPerUser: 4.1,
          completionRate: 68,
          popularHabitTypes: [
            { type: "Water Intake", count: 134 },
            { type: "Exercise", count: 112 },
            { type: "Meal Timing", count: 98 },
            { type: "Sleep Schedule", count: 87 },
            { type: "Meditation", count: 65 }
          ]
        },
        systemStats: {
          apiRequests: 26547,
          avgResponseTime: 145, // in ms
          errorRate: 0.8, // percentage
          peakHour: 18 // 6 PM
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  
  // User settings API endpoints
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user!.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  
  app.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateUserSettings(req.user!.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  
  // AI Assistant API endpoints
  app.post("/api/ai/generate-response", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll simulate AI responses based on message content
      const userMessage = req.body.message.toLowerCase();
      let response = "";
      
      if (userMessage.includes("meal") || userMessage.includes("food") || userMessage.includes("eat")) {
        response = "Based on your meal history, I notice you've been consuming about 2,200 calories daily. Your protein intake has been good, but you might benefit from more vegetables. Would you like me to suggest a balanced meal plan for tomorrow?";
      } else if (userMessage.includes("workout") || userMessage.includes("exercise")) {
        response = "I see you've been active 3 days this week - good job! For your goals, I recommend adding one more strength training session. Would you like me to create a workout that targets your specific goals?";
      } else if (userMessage.includes("sleep") || userMessage.includes("tired")) {
        response = "Your sleep patterns show an average of 6.5 hours per night. For optimal health, aim for 7-8 hours. Try establishing a consistent bedtime routine and limiting screen time before bed.";
      } else {
        response = "Thank you for your message. I've analyzed your health data and noticed you're making good progress toward your goals. Your consistency with logging meals is excellent. Is there anything specific about your health journey you'd like insights on?";
      }
      
      res.json({ 
        message: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });
  
  app.get("/api/ai/nutritional-analysis", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would analyze actual meal data
      // For now, we return simulated analysis
      res.json({
        meals: [
          {
            name: "Breakfast",
            calories: 450,
            nutrients: {
              protein: 22,
              carbs: 60,
              fat: 15,
            },
            improvements: [
              "Consider adding more protein to keep you fuller longer",
              "Try reducing sugar content by using natural sweeteners",
            ],
          },
          {
            name: "Lunch",
            calories: 620,
            nutrients: {
              protein: 35,
              carbs: 70,
              fat: 20,
            },
            improvements: [
              "Good protein content, but high in sodium",
              "Try adding more vegetables for fiber and micronutrients",
            ],
          },
        ],
        suggestions: [
          "Your protein intake is good but consider spacing it more evenly throughout the day",
          "Try to include more fiber-rich foods to reach your daily goal",
          "Consider reducing processed foods to lower sodium intake",
        ],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate nutritional analysis" });
    }
  });
  
  app.get("/api/ai/workout-recommendations", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would be based on user fitness data
      // For now, we return simulated recommendations
      res.json({
        type: "Strength Training",
        duration: "45 minutes",
        exercises: [
          {
            name: "Squats",
            sets: 3,
            reps: 12,
            notes: "Focus on form and depth",
          },
          {
            name: "Push-ups",
            sets: 3,
            reps: 15,
            notes: "Modify with knees if needed",
          },
          {
            name: "Dumbbell Rows",
            sets: 3,
            reps: 12,
            notes: "Use appropriate weight",
          },
        ],
        tips: "Rest 60-90 seconds between sets. Stay hydrated throughout.",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate workout recommendations" });
    }
  });
  
  app.get("/api/ai/health-insights", isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would analyze actual health data
      // For now, we return simulated insights
      res.json({
        weeklySummary: {
          calories: {
            average: 2150,
            goal: 2200,
            difference: -50
          },
          activeDays: {
            current: 4,
            previous: 3,
            difference: 1
          },
          waterIntake: {
            average: 1.8,
            goal: 2.5,
            percentage: 65
          }
        },
        patterns: [
          {
            type: "Nutrition",
            insight: "Your protein intake is higher on workout days. Consider maintaining this level on rest days as well for better muscle recovery."
          },
          {
            type: "Sleep",
            insight: "Your sleep quality improves on days with morning workouts. Consider adjusting your exercise schedule to favor mornings."
          },
          {
            type: "Mood",
            insight: "Higher vegetable intake correlates with improved mood scores in your tracking data. Aim for 5+ servings daily."
          }
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate health insights" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
