import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser, users } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

// Type definitions for meal-related data
export type Ingredient = {
  id: number;
  name: string;
  category: string;
  nutritionPerUnit: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  unit: string;
};

export type CookingMethod = {
  id: number;
  name: string;
  calorieMultiplier: number;
  description: string;
};

export type PremadeMeal = {
  id: number;
  name: string;
  category: string;
  ingredients: Array<{
    ingredientId: number;
    quantity: number;
    cookingMethodId?: number;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type UserMeal = {
  id: number;
  userId: number;
  name: string;
  mealType: string;
  time: string;
  date: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    calories: number;
    cookingMethod?: string;
  }>;
  totalNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

export type UserSettings = {
  theme: string;
  accentColor: string;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  measurementUnit: string;
  notifications: boolean;
  language: string;
  isAdmin?: boolean;
};

// Interface for storage operations
export interface IStorage {
  sessionStore: any; // Using 'any' to avoid type issues with SessionStore
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User>;
  
  // Meal operations
  getUserMeals(userId: number): Promise<UserMeal[]>;
  createUserMeal(userId: number, meal: Omit<UserMeal, 'id' | 'userId'>): Promise<UserMeal>;
  updateUserMeal(userId: number, mealId: number, meal: Partial<Omit<UserMeal, 'id' | 'userId'>>): Promise<UserMeal>;
  deleteUserMeal(userId: number, mealId: number): Promise<boolean>;
  
  // Ingredient operations
  getIngredients(query?: string): Promise<Ingredient[]>;
  getIngredientById(id: number): Promise<Ingredient | undefined>;
  
  // Cooking method operations
  getCookingMethods(): Promise<CookingMethod[]>;
  
  // Pre-made meal operations
  getPremadeMeals(query?: string): Promise<PremadeMeal[]>;
  getPremadeMealById(id: number): Promise<PremadeMeal | undefined>;
  
  // Settings operations
  getUserSettings(userId: number): Promise<UserSettings>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings>;
  
  // Goal operations
  getUserGoals(userId: number): Promise<any[]>;
  
  // Challenge operations
  getUserChallenges(userId: number): Promise<any[]>;
  
  // Habit operations
  getUserHabits(userId: number): Promise<any[]>;
  createUserHabit(userId: number, habit: any): Promise<any>;
  updateUserHabit(userId: number, habitId: number, habit: any): Promise<any>;
  deleteUserHabit(userId: number, habitId: number): Promise<boolean>;
  
  // Calculate nutrition
  calculateMealNutrition(ingredients: Array<{
    ingredientId: number;
    quantity: number;
    cookingMethodId?: number;
  }>): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  sessionStore: any; // Using 'any' to avoid type issues with SessionStore
  private users: Map<number, User>;
  private meals: Map<number, UserMeal[]>;
  private ingredients: Ingredient[];
  private cookingMethods: CookingMethod[];
  private premadeMeals: PremadeMeal[];
  private userSettings: Map<number, UserSettings>;
  private goals: Map<number, any[]>;
  private challenges: Map<number, any[]>;
  private habits: Map<number, any[]>;
  private currentId: number;
  private mealId: number;
  private habitId: number;
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.meals = new Map();
    this.ingredients = [];
    this.cookingMethods = [];
    this.premadeMeals = [];
    this.userSettings = new Map();
    this.goals = new Map();
    this.challenges = new Map();
    this.habits = new Map();
    this.currentId = 1;
    this.mealId = 1;
    this.habitId = 1;
    
    // Add some default data for the dashboard
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Initialize cooking methods
    this.cookingMethods = [
      {
        id: 1,
        name: "Raw",
        calorieMultiplier: 1.0,
        description: "Uncooked, natural state"
      },
      {
        id: 2,
        name: "Boiled",
        calorieMultiplier: 0.95,
        description: "Cooked in boiling water"
      },
      {
        id: 3,
        name: "Steamed",
        calorieMultiplier: 0.98,
        description: "Cooked with steam"
      },
      {
        id: 4,
        name: "Baked",
        calorieMultiplier: 1.05,
        description: "Cooked in an oven"
      },
      {
        id: 5,
        name: "Grilled",
        calorieMultiplier: 1.02,
        description: "Cooked over direct heat"
      },
      {
        id: 6,
        name: "Fried",
        calorieMultiplier: 1.5,
        description: "Cooked in oil"
      },
      {
        id: 7,
        name: "Roasted",
        calorieMultiplier: 1.1,
        description: "Cooked in an oven, typically with oil"
      },
      {
        id: 8,
        name: "Sautéed",
        calorieMultiplier: 1.3,
        description: "Cooked quickly in a small amount of oil"
      }
    ];

    // Initialize ingredients
    this.ingredients = [
      {
        id: 1,
        name: "Chicken Breast",
        category: "Protein",
        nutritionPerUnit: {
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6
        },
        unit: "100g"
      },
      {
        id: 2,
        name: "Brown Rice",
        category: "Grain",
        nutritionPerUnit: {
          calories: 112,
          protein: 2.6,
          carbs: 23.5,
          fat: 0.9
        },
        unit: "100g"
      },
      {
        id: 3,
        name: "Broccoli",
        category: "Vegetable",
        nutritionPerUnit: {
          calories: 34,
          protein: 2.8,
          carbs: 6.6,
          fat: 0.4
        },
        unit: "100g"
      },
      {
        id: 4,
        name: "Salmon",
        category: "Protein",
        nutritionPerUnit: {
          calories: 208,
          protein: 20,
          carbs: 0,
          fat: 13
        },
        unit: "100g"
      },
      {
        id: 5,
        name: "Avocado",
        category: "Fruit",
        nutritionPerUnit: {
          calories: 160,
          protein: 2,
          carbs: 8.5,
          fat: 14.7
        },
        unit: "100g"
      },
      {
        id: 6,
        name: "Eggs",
        category: "Protein",
        nutritionPerUnit: {
          calories: 155,
          protein: 13,
          carbs: 1.1,
          fat: 11
        },
        unit: "100g"
      },
      {
        id: 7,
        name: "Spinach",
        category: "Vegetable",
        nutritionPerUnit: {
          calories: 23,
          protein: 2.9,
          carbs: 3.6,
          fat: 0.4
        },
        unit: "100g"
      },
      {
        id: 8,
        name: "Sweet Potato",
        category: "Vegetable",
        nutritionPerUnit: {
          calories: 86,
          protein: 1.6,
          carbs: 20.1,
          fat: 0.1
        },
        unit: "100g"
      },
      {
        id: 9,
        name: "Olive Oil",
        category: "Oil",
        nutritionPerUnit: {
          calories: 884,
          protein: 0,
          carbs: 0,
          fat: 100
        },
        unit: "100g"
      },
      {
        id: 10,
        name: "Quinoa",
        category: "Grain",
        nutritionPerUnit: {
          calories: 120,
          protein: 4.4,
          carbs: 21.3,
          fat: 1.9
        },
        unit: "100g"
      },
      {
        id: 11,
        name: "Tomato",
        category: "Vegetable",
        nutritionPerUnit: {
          calories: 18,
          protein: 0.9,
          carbs: 3.9,
          fat: 0.2
        },
        unit: "100g"
      },
      {
        id: 12,
        name: "Beef (lean)",
        category: "Protein",
        nutritionPerUnit: {
          calories: 250,
          protein: 26,
          carbs: 0,
          fat: 17
        },
        unit: "100g"
      },
      {
        id: 13,
        name: "Pasta",
        category: "Grain",
        nutritionPerUnit: {
          calories: 131,
          protein: 5,
          carbs: 25,
          fat: 1.1
        },
        unit: "100g"
      },
      {
        id: 14,
        name: "Cheese (cheddar)",
        category: "Dairy",
        nutritionPerUnit: {
          calories: 402,
          protein: 25,
          carbs: 1.3,
          fat: 33
        },
        unit: "100g"
      },
      {
        id: 15,
        name: "Pizza Dough",
        category: "Grain",
        nutritionPerUnit: {
          calories: 230,
          protein: 8,
          carbs: 45,
          fat: 2
        },
        unit: "100g"
      }
    ];

    // Initialize pre-made meals
    this.premadeMeals = [
      {
        id: 1,
        name: "Grilled Chicken with Brown Rice and Broccoli",
        category: "Healthy",
        ingredients: [
          { ingredientId: 1, quantity: 150, cookingMethodId: 5 },
          { ingredientId: 2, quantity: 100, cookingMethodId: 2 },
          { ingredientId: 3, quantity: 100, cookingMethodId: 3 }
        ],
        totalNutrition: {
          calories: 410,
          protein: 51.8,
          carbs: 30.1,
          fat: 7.3
        }
      },
      {
        id: 2,
        name: "Salmon with Sweet Potato",
        category: "Healthy",
        ingredients: [
          { ingredientId: 4, quantity: 150, cookingMethodId: 4 },
          { ingredientId: 8, quantity: 200, cookingMethodId: 4 },
          { ingredientId: 9, quantity: 10 }
        ],
        totalNutrition: {
          calories: 496,
          protein: 30,
          carbs: 40.2,
          fat: 22.5
        }
      },
      {
        id: 3,
        name: "Vegetable Omelette",
        category: "Breakfast",
        ingredients: [
          { ingredientId: 6, quantity: 150, cookingMethodId: 8 },
          { ingredientId: 7, quantity: 50, cookingMethodId: 8 },
          { ingredientId: 11, quantity: 50, cookingMethodId: 1 },
          { ingredientId: 9, quantity: 10 }
        ],
        totalNutrition: {
          calories: 358,
          protein: 21.9,
          carbs: 3.6,
          fat: 27
        }
      },
      {
        id: 4,
        name: "Beef Pasta",
        category: "Dinner",
        ingredients: [
          { ingredientId: 12, quantity: 120, cookingMethodId: 8 },
          { ingredientId: 13, quantity: 150, cookingMethodId: 2 },
          { ingredientId: 11, quantity: 80, cookingMethodId: 8 },
          { ingredientId: 9, quantity: 15 }
        ],
        totalNutrition: {
          calories: 584,
          protein: 45.5,
          carbs: 39.6,
          fat: 25.1
        }
      },
      {
        id: 5,
        name: "Cheese Pizza",
        category: "Fast Food",
        ingredients: [
          { ingredientId: 15, quantity: 200, cookingMethodId: 4 },
          { ingredientId: 14, quantity: 100, cookingMethodId: 4 },
          { ingredientId: 11, quantity: 50, cookingMethodId: 4 }
        ],
        totalNutrition: {
          calories: 871,
          protein: 41.9,
          carbs: 93.9,
          fat: 36.1
        }
      }
    ];

    // Default user settings
    const defaultSettings: UserSettings = {
      theme: 'light',
      accentColor: 'blue',
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      measurementUnit: 'metric',
      notifications: true,
      language: 'english',
      isAdmin: false
    };
    this.userSettings.set(1, defaultSettings);

    this.goals.set(1, [
      { id: 1, name: "Drink water (2L)", current: 3, target: 8, unit: "glasses", color: "bg-blue-500" },
      { id: 2, name: "Eat vegetables (300g)", current: 150, target: 300, unit: "g", color: "bg-green-500" },
      { id: 3, name: "Limit sugar (25g)", current: 18, target: 25, unit: "g", color: "bg-red-500" },
      { id: 4, name: "No junk food", current: 1, target: 1, unit: "", color: "bg-green-500", completed: true }
    ]);
    
    this.challenges.set(1, [
      {
        id: 1,
        title: "7 Day Protein Challenge",
        description: "Reach your daily protein goals for 7 consecutive days",
        current: 3,
        target: 7,
        bgColor: "from-blue-500 to-indigo-600",
      },
      {
        id: 2,
        title: "Sugar Detox Week",
        description: "Stay under 25g of added sugar each day for a week",
        current: 4,
        target: 7,
        bgColor: "from-green-500 to-teal-600",
      },
      {
        id: 3,
        title: "Hydration Quest",
        description: "Drink 2L of water daily for 10 consecutive days",
        current: 6,
        target: 10,
        bgColor: "from-purple-500 to-pink-600",
      }
    ]);
    
    // Convert old meal format to new format
    const userMeals: UserMeal[] = [
      {
        id: 1,
        userId: 1,
        name: "Breakfast",
        mealType: "Breakfast",
        time: "8:30 AM",
        date: new Date().toISOString().split('T')[0],
        ingredients: [
          { name: "Oatmeal with banana", quantity: "250g", calories: 250 },
          { name: "Black coffee", quantity: "240ml", calories: 5 }
        ],
        totalNutrition: {
          calories: 320,
          protein: 12,
          carbs: 55,
          fat: 5
        }
      },
      {
        id: 2,
        userId: 1,
        name: "Lunch",
        mealType: "Lunch",
        time: "12:45 PM",
        date: new Date().toISOString().split('T')[0],
        ingredients: [
          { name: "Grilled chicken salad", quantity: "350g", calories: 400, cookingMethod: "Grilled" },
          { name: "Whole grain bread", quantity: "1 slice", calories: 120 }
        ],
        totalNutrition: {
          calories: 520,
          protein: 40,
          carbs: 30,
          fat: 20
        }
      },
      {
        id: 3,
        userId: 1,
        name: "Dinner",
        mealType: "Dinner", 
        time: "7:30 PM",
        date: new Date().toISOString().split('T')[0],
        ingredients: [
          { name: "Salmon with vegetables", quantity: "300g", calories: 350, cookingMethod: "Baked" },
          { name: "Brown rice", quantity: "150g", calories: 160, cookingMethod: "Boiled" }
        ],
        totalNutrition: {
          calories: 425,
          protein: 35,
          carbs: 25,
          fat: 18
        }
      }
    ];
    this.meals.set(1, userMeals);
    this.mealId = 4; // Next meal ID
    
    // Initialize habits
    const userHabits = [
      {
        id: 1,
        userId: 1,
        name: "Drink 8 glasses of water",
        description: "Stay hydrated throughout the day",
        type: "hydration",
        frequency: "daily",
        timeOfDay: "all-day",
        streakDays: 5,
        backgroundColor: "blue",
        startDate: new Date(),
        status: "active"
      },
      {
        id: 2,
        userId: 1,
        name: "No processed sugar",
        description: "Avoid foods with added sugar",
        type: "diet",
        frequency: "daily",
        timeOfDay: "all-day",
        streakDays: 3,
        backgroundColor: "red",
        startDate: new Date(),
        status: "active"
      },
      {
        id: 3,
        userId: 1,
        name: "Take vitamins",
        description: "Daily supplements",
        type: "supplement",
        frequency: "daily",
        timeOfDay: "morning",
        streakDays: 10,
        backgroundColor: "green",
        startDate: new Date(),
        status: "active"
      }
    ];
    this.habits.set(1, userHabits);
    this.habitId = 4; // Next habit ID
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const createdAt = new Date();
    
    // Create user object with schema that matches the database
    const user: User = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      dietaryPreferences: insertUser.dietaryPreferences || {},
      createdAt
    };
    
    this.users.set(id, user);
    
    // Initialize empty data for the new user
    this.meals.set(id, []);
    this.goals.set(id, []);
    this.challenges.set(id, []);
    this.userSettings.set(id, {
      theme: 'light',
      accentColor: 'blue',
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      measurementUnit: 'metric',
      notifications: true,
      language: 'english',
      isAdmin: false
    });
    
    // Copy default data for demo purposes
    if (this.meals.has(1)) {
      this.meals.set(id, [...(this.meals.get(1) || [])]);
    }
    
    if (this.goals.has(1)) {
      this.goals.set(id, [...(this.goals.get(1) || [])]);
    }
    
    if (this.challenges.has(1)) {
      this.challenges.set(id, [...(this.challenges.get(1) || [])]);
    }
    
    if (this.habits.has(1)) {
      this.habits.set(id, [...(this.habits.get(1) || [])]);
    }
    
    return user;
  }
  
  async updateUserPreferences(userId: number, preferences: any): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    let currentPreferences = {};
    if (typeof user.dietaryPreferences === 'object' && user.dietaryPreferences !== null) {
      currentPreferences = user.dietaryPreferences;
    }
    
    const updatedUser = {
      ...user,
      dietaryPreferences: {
        ...currentPreferences,
        ...preferences
      }
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Meal operations
  async getUserMeals(userId: number): Promise<UserMeal[]> {
    return this.meals.get(userId) || [];
  }
  
  async createUserMeal(userId: number, meal: Omit<UserMeal, 'id' | 'userId'>): Promise<UserMeal> {
    const userMeals = this.meals.get(userId) || [];
    const newMeal: UserMeal = {
      ...meal,
      id: this.mealId++,
      userId
    };
    
    userMeals.push(newMeal);
    this.meals.set(userId, userMeals);
    
    return newMeal;
  }
  
  async updateUserMeal(userId: number, mealId: number, meal: Partial<Omit<UserMeal, 'id' | 'userId'>>): Promise<UserMeal> {
    const userMeals = this.meals.get(userId) || [];
    const mealIndex = userMeals.findIndex(m => m.id === mealId);
    
    if (mealIndex === -1) {
      throw new Error("Meal not found");
    }
    
    const updatedMeal: UserMeal = {
      ...userMeals[mealIndex],
      ...meal
    };
    
    userMeals[mealIndex] = updatedMeal;
    this.meals.set(userId, userMeals);
    
    return updatedMeal;
  }
  
  async deleteUserMeal(userId: number, mealId: number): Promise<boolean> {
    const userMeals = this.meals.get(userId) || [];
    const mealIndex = userMeals.findIndex(m => m.id === mealId);
    
    if (mealIndex === -1) {
      return false;
    }
    
    userMeals.splice(mealIndex, 1);
    this.meals.set(userId, userMeals);
    
    return true;
  }
  
  // Ingredient operations
  async getIngredients(query?: string): Promise<Ingredient[]> {
    if (!query) {
      return this.ingredients;
    }
    
    return this.ingredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(query.toLowerCase()) ||
      ingredient.category.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  async getIngredientById(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.find(ingredient => ingredient.id === id);
  }
  
  // Cooking method operations
  async getCookingMethods(): Promise<CookingMethod[]> {
    return this.cookingMethods;
  }
  
  // Pre-made meal operations
  async getPremadeMeals(query?: string): Promise<PremadeMeal[]> {
    if (!query) {
      return this.premadeMeals;
    }
    
    return this.premadeMeals.filter(meal => 
      meal.name.toLowerCase().includes(query.toLowerCase()) ||
      meal.category.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  async getPremadeMealById(id: number): Promise<PremadeMeal | undefined> {
    return this.premadeMeals.find(meal => meal.id === id);
  }
  
  // Settings operations
  async getUserSettings(userId: number): Promise<UserSettings> {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      const defaultSettings: UserSettings = {
        theme: 'light',
        accentColor: 'blue',
        calorieGoal: 2000,
        proteinGoal: 150,
        carbsGoal: 200,
        fatGoal: 65,
        measurementUnit: 'metric',
        notifications: true,
        language: 'english',
        isAdmin: false
      };
      this.userSettings.set(userId, defaultSettings);
      return defaultSettings;
    }
    return settings;
  }
  
  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    const currentSettings = await this.getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };
    
    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }
  
  // Goal operations
  async getUserGoals(userId: number): Promise<any[]> {
    return this.goals.get(userId) || [];
  }
  
  // Challenge operations
  async getUserChallenges(userId: number): Promise<any[]> {
    return this.challenges.get(userId) || [];
  }
  
  // Habit operations
  async getUserHabits(userId: number): Promise<any[]> {
    return this.habits.get(userId) || [];
  }
  
  async createUserHabit(userId: number, habit: any): Promise<any> {
    const userHabits = this.habits.get(userId) || [];
    const newHabit = {
      ...habit,
      id: this.habitId++,
      userId,
      startDate: new Date(),
      streakDays: 0,
      status: "active"
    };
    
    userHabits.push(newHabit);
    this.habits.set(userId, userHabits);
    
    return newHabit;
  }
  
  async updateUserHabit(userId: number, habitId: number, habit: any): Promise<any> {
    const userHabits = this.habits.get(userId) || [];
    const habitIndex = userHabits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      throw new Error("Habit not found");
    }
    
    const updatedHabit = {
      ...userHabits[habitIndex],
      ...habit
    };
    
    userHabits[habitIndex] = updatedHabit;
    this.habits.set(userId, userHabits);
    
    return updatedHabit;
  }
  
  async deleteUserHabit(userId: number, habitId: number): Promise<boolean> {
    const userHabits = this.habits.get(userId) || [];
    const habitIndex = userHabits.findIndex(h => h.id === habitId);
    
    if (habitIndex === -1) {
      return false;
    }
    
    userHabits.splice(habitIndex, 1);
    this.habits.set(userId, userHabits);
    
    return true;
  }
  
  // Calculate meal nutrition based on ingredients and cooking methods
  async calculateMealNutrition(ingredients: Array<{
    ingredientId: number;
    quantity: number;
    cookingMethodId?: number;
  }>): Promise<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }> {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    for (const item of ingredients) {
      const ingredient = await this.getIngredientById(item.ingredientId);
      if (!ingredient) continue;
      
      const cookingMethod = item.cookingMethodId 
        ? this.cookingMethods.find(method => method.id === item.cookingMethodId)
        : undefined;
      
      const multiplier = cookingMethod ? cookingMethod.calorieMultiplier : 1;
      const quantityFactor = item.quantity / 100; // Convert to per 100g
      
      nutrition.calories += ingredient.nutritionPerUnit.calories * quantityFactor * multiplier;
      nutrition.protein += ingredient.nutritionPerUnit.protein * quantityFactor;
      nutrition.carbs += ingredient.nutritionPerUnit.carbs * quantityFactor;
      nutrition.fat += ingredient.nutritionPerUnit.fat * quantityFactor;
    }
    
    // Round values to 1 decimal place
    nutrition.calories = Math.round(nutrition.calories);
    nutrition.protein = Math.round(nutrition.protein * 10) / 10;
    nutrition.carbs = Math.round(nutrition.carbs * 10) / 10;
    nutrition.fat = Math.round(nutrition.fat * 10) / 10;
    
    return nutrition;
  }
}

// Export a single instance to be used throughout the app
export const storage = new MemStorage();
