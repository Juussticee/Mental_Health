import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("user_id").primaryKey(), // Match the DB schema's user_id column
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password_hash").notNull(), // Match the DB schema's password_hash column
  dietaryPreferences: jsonb("dietary_preferences").default('{}').notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  dietaryPreferences: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Additional tables from the schema
export const categories = pgTable("categories", {
  id: serial("category_id").primaryKey(),
  name: text("category_name").notNull().unique()
});

export const ingredients = pgTable("ingredients", {
  id: serial("ingredient_id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  unit: text("unit").default("g")
});

export const nutritionalInfo = pgTable("nutritional_info", {
  id: serial("nutrition_id").primaryKey(),
  ingredientId: integer("ingredient_id").references(() => ingredients.id, { onDelete: "cascade" }),
  cookingMethod: text("cooking_method"),
  nutrition: jsonb("nutrition").notNull().default('{}')
});

export const meals = pgTable("meals", {
  id: serial("meal_id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("meal_name").notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  nutrition: jsonb("nutrition").notNull().default('{}'),
  createdAt: timestamp("created_at").defaultNow()
});

export const mealIngredients = pgTable("meal_ingredients", {
  mealId: integer("meal_id").references(() => meals.id, { onDelete: "cascade" }),
  ingredientId: integer("ingredient_id").references(() => ingredients.id, { onDelete: "cascade" }),
  quantity: text("quantity").notNull(),
  unit: text("unit"),
  cookingMethod: text("cooking_method")
});

export const foodHabits = pgTable("food_habits", {
  id: serial("habit_id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("habit_name").notNull(),
  description: text("description"),
  frequency: text("frequency"),
  timeOfDay: text("time_of_day"),
  startDate: timestamp("start_date").notNull(),
  status: text("status").default("active"),
  streakDays: integer("streak_days").default(0),
  backgroundColor: text("background_color").default("blue"),
  type: text("habit_type").default("diet")
});

export const userPreferences = pgTable("user_preferences", {
  userId: integer("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").default("light"),
  accentColor: text("accent_color").default("blue"),
  isAdmin: boolean("is_admin").default(false),
});
