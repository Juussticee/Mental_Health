// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
var MemoryStore = createMemoryStore(session);
var MemStorage = class {
  sessionStore;
  // Using 'any' to avoid type issues with SessionStore
  users;
  meals;
  ingredients;
  cookingMethods;
  premadeMeals;
  userSettings;
  goals;
  challenges;
  habits;
  currentId;
  mealId;
  habitId;
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 864e5
      // prune expired entries every 24h
    });
    this.users = /* @__PURE__ */ new Map();
    this.meals = /* @__PURE__ */ new Map();
    this.ingredients = [];
    this.cookingMethods = [];
    this.premadeMeals = [];
    this.userSettings = /* @__PURE__ */ new Map();
    this.goals = /* @__PURE__ */ new Map();
    this.challenges = /* @__PURE__ */ new Map();
    this.habits = /* @__PURE__ */ new Map();
    this.currentId = 1;
    this.mealId = 1;
    this.habitId = 1;
    this.initializeDefaultData();
  }
  initializeDefaultData() {
    this.cookingMethods = [
      {
        id: 1,
        name: "Raw",
        calorieMultiplier: 1,
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
        name: "Saut\xE9ed",
        calorieMultiplier: 1.3,
        description: "Cooked quickly in a small amount of oil"
      }
    ];
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
    const defaultSettings = {
      theme: "light",
      accentColor: "blue",
      calorieGoal: 2e3,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      measurementUnit: "metric",
      notifications: true,
      language: "english",
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
        bgColor: "from-blue-500 to-indigo-600"
      },
      {
        id: 2,
        title: "Sugar Detox Week",
        description: "Stay under 25g of added sugar each day for a week",
        current: 4,
        target: 7,
        bgColor: "from-green-500 to-teal-600"
      },
      {
        id: 3,
        title: "Hydration Quest",
        description: "Drink 2L of water daily for 10 consecutive days",
        current: 6,
        target: 10,
        bgColor: "from-purple-500 to-pink-600"
      }
    ]);
    const userMeals = [
      {
        id: 1,
        userId: 1,
        name: "Breakfast",
        mealType: "Breakfast",
        time: "8:30 AM",
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
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
    this.mealId = 4;
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
        startDate: /* @__PURE__ */ new Date(),
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
        startDate: /* @__PURE__ */ new Date(),
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
        startDate: /* @__PURE__ */ new Date(),
        status: "active"
      }
    ];
    this.habits.set(1, userHabits);
    this.habitId = 4;
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }
  async createUser(insertUser) {
    const id = this.currentId++;
    const createdAt = /* @__PURE__ */ new Date();
    const user = {
      id,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      dietaryPreferences: insertUser.dietaryPreferences || {},
      createdAt
    };
    this.users.set(id, user);
    this.meals.set(id, []);
    this.goals.set(id, []);
    this.challenges.set(id, []);
    this.userSettings.set(id, {
      theme: "light",
      accentColor: "blue",
      calorieGoal: 2e3,
      proteinGoal: 150,
      carbsGoal: 200,
      fatGoal: 65,
      measurementUnit: "metric",
      notifications: true,
      language: "english",
      isAdmin: false
    });
    if (this.meals.has(1)) {
      this.meals.set(id, [...this.meals.get(1) || []]);
    }
    if (this.goals.has(1)) {
      this.goals.set(id, [...this.goals.get(1) || []]);
    }
    if (this.challenges.has(1)) {
      this.challenges.set(id, [...this.challenges.get(1) || []]);
    }
    if (this.habits.has(1)) {
      this.habits.set(id, [...this.habits.get(1) || []]);
    }
    return user;
  }
  async updateUserPreferences(userId, preferences) {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    let currentPreferences = {};
    if (typeof user.dietaryPreferences === "object" && user.dietaryPreferences !== null) {
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
  async getUserMeals(userId) {
    return this.meals.get(userId) || [];
  }
  async createUserMeal(userId, meal) {
    const userMeals = this.meals.get(userId) || [];
    const newMeal = {
      ...meal,
      id: this.mealId++,
      userId
    };
    userMeals.push(newMeal);
    this.meals.set(userId, userMeals);
    return newMeal;
  }
  async updateUserMeal(userId, mealId, meal) {
    const userMeals = this.meals.get(userId) || [];
    const mealIndex = userMeals.findIndex((m) => m.id === mealId);
    if (mealIndex === -1) {
      throw new Error("Meal not found");
    }
    const updatedMeal = {
      ...userMeals[mealIndex],
      ...meal
    };
    userMeals[mealIndex] = updatedMeal;
    this.meals.set(userId, userMeals);
    return updatedMeal;
  }
  async deleteUserMeal(userId, mealId) {
    const userMeals = this.meals.get(userId) || [];
    const mealIndex = userMeals.findIndex((m) => m.id === mealId);
    if (mealIndex === -1) {
      return false;
    }
    userMeals.splice(mealIndex, 1);
    this.meals.set(userId, userMeals);
    return true;
  }
  // Ingredient operations
  async getIngredients(query) {
    if (!query) {
      return this.ingredients;
    }
    return this.ingredients.filter(
      (ingredient) => ingredient.name.toLowerCase().includes(query.toLowerCase()) || ingredient.category.toLowerCase().includes(query.toLowerCase())
    );
  }
  async getIngredientById(id) {
    return this.ingredients.find((ingredient) => ingredient.id === id);
  }
  // Cooking method operations
  async getCookingMethods() {
    return this.cookingMethods;
  }
  // Pre-made meal operations
  async getPremadeMeals(query) {
    if (!query) {
      return this.premadeMeals;
    }
    return this.premadeMeals.filter(
      (meal) => meal.name.toLowerCase().includes(query.toLowerCase()) || meal.category.toLowerCase().includes(query.toLowerCase())
    );
  }
  async getPremadeMealById(id) {
    return this.premadeMeals.find((meal) => meal.id === id);
  }
  // Settings operations
  async getUserSettings(userId) {
    const settings = this.userSettings.get(userId);
    if (!settings) {
      const defaultSettings = {
        theme: "light",
        accentColor: "blue",
        calorieGoal: 2e3,
        proteinGoal: 150,
        carbsGoal: 200,
        fatGoal: 65,
        measurementUnit: "metric",
        notifications: true,
        language: "english",
        isAdmin: false
      };
      this.userSettings.set(userId, defaultSettings);
      return defaultSettings;
    }
    return settings;
  }
  async updateUserSettings(userId, settings) {
    const currentSettings = await this.getUserSettings(userId);
    const updatedSettings = {
      ...currentSettings,
      ...settings
    };
    this.userSettings.set(userId, updatedSettings);
    return updatedSettings;
  }
  // Goal operations
  async getUserGoals(userId) {
    return this.goals.get(userId) || [];
  }
  // Challenge operations
  async getUserChallenges(userId) {
    return this.challenges.get(userId) || [];
  }
  // Habit operations
  async getUserHabits(userId) {
    return this.habits.get(userId) || [];
  }
  async createUserHabit(userId, habit) {
    const userHabits = this.habits.get(userId) || [];
    const newHabit = {
      ...habit,
      id: this.habitId++,
      userId,
      startDate: /* @__PURE__ */ new Date(),
      streakDays: 0,
      status: "active"
    };
    userHabits.push(newHabit);
    this.habits.set(userId, userHabits);
    return newHabit;
  }
  async updateUserHabit(userId, habitId, habit) {
    const userHabits = this.habits.get(userId) || [];
    const habitIndex = userHabits.findIndex((h) => h.id === habitId);
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
  async deleteUserHabit(userId, habitId) {
    const userHabits = this.habits.get(userId) || [];
    const habitIndex = userHabits.findIndex((h) => h.id === habitId);
    if (habitIndex === -1) {
      return false;
    }
    userHabits.splice(habitIndex, 1);
    this.habits.set(userId, userHabits);
    return true;
  }
  // Calculate meal nutrition based on ingredients and cooking methods
  async calculateMealNutrition(ingredients) {
    const nutrition = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    for (const item of ingredients) {
      const ingredient = await this.getIngredientById(item.ingredientId);
      if (!ingredient) continue;
      const cookingMethod = item.cookingMethodId ? this.cookingMethods.find((method) => method.id === item.cookingMethodId) : void 0;
      const multiplier = cookingMethod ? cookingMethod.calorieMultiplier : 1;
      const quantityFactor = item.quantity / 100;
      nutrition.calories += ingredient.nutritionPerUnit.calories * quantityFactor * multiplier;
      nutrition.protein += ingredient.nutritionPerUnit.protein * quantityFactor;
      nutrition.carbs += ingredient.nutritionPerUnit.carbs * quantityFactor;
      nutrition.fat += ingredient.nutritionPerUnit.fat * quantityFactor;
    }
    nutrition.calories = Math.round(nutrition.calories);
    nutrition.protein = Math.round(nutrition.protein * 10) / 10;
    nutrition.carbs = Math.round(nutrition.carbs * 10) / 10;
    nutrition.fat = Math.round(nutrition.fat * 10) / 10;
    return nutrition;
  }
};
var storage = new MemStorage();

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "healthtrackr-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1e3 * 60 * 60 * 24 * 7
      // 1 week
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.use(async (req, res, next) => {
    try {
      const testUser = await storage.getUserByUsername("testuser");
      if (!testUser) {
        await storage.createUser({
          username: "testuser",
          email: "test@example.com",
          password: await hashPassword("Password123!"),
          dietaryPreferences: { allergies: ["none"], preferences: ["balanced"] }
        });
        console.log("Created test user: testuser / Password123!");
      }
      next();
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).send("Invalid email format");
      }
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already in use");
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).send(info?.message || "Invalid username or password");
      req.login(user, (err2) => {
        if (err2) return next(err2);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

// server/routes.ts
var isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
};
var isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  try {
    const settings = await storage.getUserSettings(req.user.id);
    if (!settings || !settings.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: "Failed to verify admin status" });
  }
};
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const meals = await storage.getUserMeals(req.user.id);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meals" });
    }
  });
  app2.post("/api/meals", isAuthenticated, async (req, res) => {
    try {
      const newMeal = await storage.createUserMeal(req.user.id, req.body);
      res.status(201).json(newMeal);
    } catch (error) {
      res.status(500).json({ error: "Failed to create meal" });
    }
  });
  app2.put("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const updatedMeal = await storage.updateUserMeal(req.user.id, mealId, req.body);
      res.json(updatedMeal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update meal" });
    }
  });
  app2.delete("/api/meals/:id", isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const success = await storage.deleteUserMeal(req.user.id, mealId);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(404).json({ error: "Meal not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meal" });
    }
  });
  app2.get("/api/ingredients", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      const ingredients = await storage.getIngredients(query);
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });
  app2.get("/api/cooking-methods", isAuthenticated, async (req, res) => {
    try {
      const cookingMethods = await storage.getCookingMethods();
      res.json(cookingMethods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cooking methods" });
    }
  });
  app2.get("/api/premade-meals", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      const meals = await storage.getPremadeMeals(query);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pre-made meals" });
    }
  });
  app2.get("/api/premade-meals/:id", isAuthenticated, async (req, res) => {
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
  app2.post("/api/calculate-nutrition", isAuthenticated, async (req, res) => {
    try {
      const nutrition = await storage.calculateMealNutrition(req.body.ingredients);
      res.json(nutrition);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate nutrition" });
    }
  });
  app2.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateUserSettings(req.user.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.get("/api/goals", isAuthenticated, async (req, res) => {
    try {
      const goals = await storage.getUserGoals(req.user.id);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });
  app2.get("/api/challenges", isAuthenticated, async (req, res) => {
    try {
      const challenges = await storage.getUserChallenges(req.user.id);
      res.json(challenges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challenges" });
    }
  });
  app2.get("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const habits = await storage.getUserHabits(req.user.id);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch habits" });
    }
  });
  app2.post("/api/habits", isAuthenticated, async (req, res) => {
    try {
      const newHabit = await storage.createUserHabit(req.user.id, req.body);
      res.status(201).json(newHabit);
    } catch (error) {
      res.status(500).json({ error: "Failed to create habit" });
    }
  });
  app2.put("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const updatedHabit = await storage.updateUserHabit(req.user.id, habitId, req.body);
      res.json(updatedHabit);
    } catch (error) {
      res.status(500).json({ error: "Failed to update habit" });
    }
  });
  app2.delete("/api/habits/:id", isAuthenticated, async (req, res) => {
    try {
      const habitId = parseInt(req.params.id);
      const success = await storage.deleteUserHabit(req.user.id, habitId);
      if (success) {
        res.sendStatus(204);
      } else {
        res.status(404).json({ error: "Habit not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to delete habit" });
    }
  });
  app2.put("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const updatedUser = await storage.updateUserPreferences(
        req.user.id,
        req.body.preferences
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });
  app2.get("/api/admin/check", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      const isAdmin2 = settings && settings.isAdmin === true;
      res.json({ isAdmin: isAdmin2 });
    } catch (error) {
      res.status(500).json({ error: "Failed to check admin status" });
    }
  });
  app2.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
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
  app2.get("/api/admin/analytics", isAdmin, async (req, res) => {
    try {
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
          avgResponseTime: 145,
          // in ms
          errorRate: 0.8,
          // percentage
          peakHour: 18
          // 6 PM
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getUserSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateUserSettings(req.user.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.post("/api/ai/generate-response", isAuthenticated, async (req, res) => {
    try {
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
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });
  app2.get("/api/ai/nutritional-analysis", isAuthenticated, async (req, res) => {
    try {
      res.json({
        meals: [
          {
            name: "Breakfast",
            calories: 450,
            nutrients: {
              protein: 22,
              carbs: 60,
              fat: 15
            },
            improvements: [
              "Consider adding more protein to keep you fuller longer",
              "Try reducing sugar content by using natural sweeteners"
            ]
          },
          {
            name: "Lunch",
            calories: 620,
            nutrients: {
              protein: 35,
              carbs: 70,
              fat: 20
            },
            improvements: [
              "Good protein content, but high in sodium",
              "Try adding more vegetables for fiber and micronutrients"
            ]
          }
        ],
        suggestions: [
          "Your protein intake is good but consider spacing it more evenly throughout the day",
          "Try to include more fiber-rich foods to reach your daily goal",
          "Consider reducing processed foods to lower sodium intake"
        ]
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate nutritional analysis" });
    }
  });
  app2.get("/api/ai/workout-recommendations", isAuthenticated, async (req, res) => {
    try {
      res.json({
        type: "Strength Training",
        duration: "45 minutes",
        exercises: [
          {
            name: "Squats",
            sets: 3,
            reps: 12,
            notes: "Focus on form and depth"
          },
          {
            name: "Push-ups",
            sets: 3,
            reps: 15,
            notes: "Modify with knees if needed"
          },
          {
            name: "Dumbbell Rows",
            sets: 3,
            reps: 12,
            notes: "Use appropriate weight"
          }
        ],
        tips: "Rest 60-90 seconds between sets. Stay hydrated throughout."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate workout recommendations" });
    }
  });
  app2.get("/api/ai/health-insights", isAuthenticated, async (req, res) => {
    try {
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import "dotenv/config";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`HealthTrackr app serving on port ${port}`);
    if (app.get("env") === "development") {
      log(`Test user available: testuser / Password123!`);
    }
  });
})();
