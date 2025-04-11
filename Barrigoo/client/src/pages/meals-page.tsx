import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Loader2, Search, Plus, AlertCircle, MoreVertical, 
  Pencil, Trash2, Copy, Share, CalendarRange, X, Check,
  Pizza
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Combobox } from "@/components/ui/combobox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Sidebar from "@/components/dashboard/Sidebar";

// Meal type definition
type Meal = {
  id: number;
  name: string;
  mealType: string;
  time: string;
  calories: number;
  ingredients: {
    name: string;
    quantity: string;
    calories: number;
    cookingMethod?: string;
  }[];
  date: string;
};

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const defaultCookingMethods = ["Raw", "Boiled", "Steamed", "Fried", "Grilled", "Baked", "Roasted", "Sautéed"];

// Ingredient schema
const ingredientSchema = z.object({
  name: z.string().min(2, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  cookingMethod: z.string().optional(),
  calories: z.number().min(0, "Calories must be a positive number").or(z.string().regex(/^\d+$/).transform(Number))
});

// Recipe schema
const recipeSchema = z.object({
  name: z.string().min(2, "Recipe name is required"),
  servingSize: z.string().min(1, "Serving size is required"),
  calories: z.number().min(0, "Calories must be a positive number").or(z.string().regex(/^\d+$/).transform(Number))
});

// Meal form schema
const addMealSchema = z.object({
  name: z.string().min(2, "Meal name is required"),
  mealType: z.string().min(1, "Meal type is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  inputMethod: z.enum(["ingredients", "recipe"]),
  ingredients: z.array(ingredientSchema).optional(),
  recipe: recipeSchema.optional()
});

type MealFormValues = z.infer<typeof addMealSchema>;

const defaultIngredient = {
  name: "",
  quantity: "",
  cookingMethod: "Raw",
  calories: 0
};

// Meal item component
const MealItem = ({ meal, onEdit, onDelete }: { meal: Meal, onEdit: (meal: Meal) => void, onDelete: (id: number) => void }) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge className="mb-2">{meal.mealType}</Badge>
            <CardTitle className="text-lg">{meal.name}</CardTitle>
            <CardDescription>{meal.time} • {meal.calories} kcal</CardDescription>
          </div>
          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(meal)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(meal.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarRange className="h-4 w-4 mr-2" />
                  Add to Meal Plan
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share Recipe
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-700">Ingredients:</p>
          <ul className="text-sm text-gray-600 list-disc pl-5">
            {meal.ingredients.map((ingredient, i) => (
              <li key={i}>
                {ingredient.name} ({ingredient.quantity}) 
                {ingredient.cookingMethod && ` - ${ingredient.cookingMethod}`} 
                - {ingredient.calories} kcal
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Type definitions for our API responses
type Ingredient = {
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

type CookingMethod = {
  id: number;
  name: string;
  calorieMultiplier: number;
  description: string;
};

type PremadeMeal = {
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

// Add meal form component
const AddMealForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState([{ ...defaultIngredient }]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPremadeMeal, setSelectedPremadeMeal] = useState<PremadeMeal | null>(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPremadeMealSuggestion, setShowPremadeMealSuggestion] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<PremadeMeal | null>(null);
  
  // Get ingredients from API
  const { data: ingredientOptions = [], isLoading: isLoadingIngredients } = useQuery({
    queryKey: ['/api/ingredients', searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/ingredients?q=${encodeURIComponent(searchQuery)}` 
        : '/api/ingredients';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch ingredients');
      return await res.json() as Ingredient[];
    },
    enabled: true,
  });

  // Get cooking methods from API
  const { data: cookingMethods = [], isLoading: isLoadingCookingMethods } = useQuery({
    queryKey: ['/api/cooking-methods'],
    queryFn: async () => {
      const res = await fetch('/api/cooking-methods');
      if (!res.ok) throw new Error('Failed to fetch cooking methods');
      return await res.json() as CookingMethod[];
    },
  });
  
  // Helper function to render cooking method options
  const renderCookingMethodOptions = () => {
    if (Array.isArray(cookingMethods) && cookingMethods.length > 0) {
      if (typeof cookingMethods[0] === 'string') {
        return (cookingMethods as string[]).map((method) => (
          <SelectItem key={method} value={method}>
            {method}
          </SelectItem>
        ));
      } else {
        return (cookingMethods as CookingMethod[]).map((method) => (
          <SelectItem key={method.id.toString()} value={method.name}>
            {method.name}
          </SelectItem>
        ));
      }
    } else {
      return defaultCookingMethods.map((method) => (
        <SelectItem key={method} value={method}>
          {method}
        </SelectItem>
      ));
    }
  };

  // Get pre-made meals from API
  const { data: premadeMeals = [], isLoading: isLoadingPremadeMeals } = useQuery({
    queryKey: ['/api/premade-meals', searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/premade-meals?q=${encodeURIComponent(searchQuery)}` 
        : '/api/premade-meals';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch pre-made meals');
      return await res.json() as PremadeMeal[];
    },
    enabled: true,
  });

  // Create meal mutation
  const createMealMutation = useMutation({
    mutationFn: async (mealData: any) => {
      const res = await apiRequest('POST', '/api/meals', mealData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      toast({
        title: 'Meal added',
        description: 'Your meal has been successfully added.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Failed to add meal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      name: "",
      mealType: "Breakfast",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      inputMethod: "ingredients",
      ingredients: [{ ...defaultIngredient }],
      recipe: {
        name: "",
        servingSize: "",
        calories: 0
      }
    },
  });

  const inputMethod = form.watch("inputMethod");
  const watchedIngredients = form.watch("ingredients") || [];
  const mealName = form.watch("name");
  
  // Update total calories when ingredients change
  useEffect(() => {
    if (inputMethod === "ingredients" && watchedIngredients.length > 0) {
      calculateTotalCalories();
      checkForSimilarMeals();
    }
  }, [watchedIngredients, inputMethod]);

  // Calculate total calories from ingredients
  const calculateTotalCalories = async () => {
    try {
      // For a real implementation, we'd send the ingredients to the API
      // For now, we'll just add up the calories directly
      const total = watchedIngredients.reduce((sum, ingredient) => {
        return sum + (ingredient.calories || 0);
      }, 0);
      
      setTotalCalories(total);
    } catch (error) {
      console.error("Error calculating total calories:", error);
    }
  };

  // Check if current ingredients match any pre-made meals
  const checkForSimilarMeals = () => {
    if (!mealName || watchedIngredients.length < 2 || premadeMeals.length === 0) {
      setShowPremadeMealSuggestion(false);
      return;
    }

    // Get ingredient names for comparison
    const currentIngredientNames = watchedIngredients
      .map(ing => ing.name.toLowerCase())
      .filter(name => name.length > 0);

    if (currentIngredientNames.length < 2) return;

    // Find potential matches in pre-made meals
    const similarMeals = premadeMeals.filter(meal => {
      const mealIngredientCount = meal.ingredients.length;
      let matchCount = 0;
      
      // This is a simplified matching algorithm
      // A real implementation would be more sophisticated
      meal.ingredients.forEach(mealIng => {
        const matchedIngredient = ingredientOptions.find(opt => opt.id === mealIng.ingredientId);
        if (matchedIngredient) {
          const ingName = matchedIngredient.name.toLowerCase();
          if (currentIngredientNames.some(name => ingName.includes(name) || name.includes(ingName))) {
            matchCount++;
          }
        }
      });

      // Consider it a match if at least 50% of ingredients match
      return (matchCount / mealIngredientCount >= 0.5);
    });

    if (similarMeals.length > 0) {
      setSuggestedMeal(similarMeals[0]);
      setShowPremadeMealSuggestion(true);
    } else {
      setShowPremadeMealSuggestion(false);
    }
  };
  
  // Helper to format ingredient options for combobox
  const formatIngredientOptions = () => {
    return ingredientOptions.map(ingredient => ({
      value: ingredient.id.toString(),
      label: `${ingredient.name} (${ingredient.unit}, ${ingredient.nutritionPerUnit.calories} kcal)`,
    }));
  };

  // Helper to format pre-made meal options for combobox
  const formatPremadeMealOptions = () => {
    return premadeMeals.map(meal => ({
      value: meal.id.toString(),
      label: `${meal.name} (${meal.totalNutrition.calories} kcal)`,
    }));
  };

  // Handle ingredient selection
  const handleIngredientSelect = async (ingredientId: string, index: number) => {
    const selectedIngredient = ingredientOptions.find(ing => ing.id.toString() === ingredientId);
    
    if (!selectedIngredient) return;
    
    // Update the form with the selected ingredient info
    form.setValue(`ingredients.${index}.name`, selectedIngredient.name);
    form.setValue(`ingredients.${index}.calories`, selectedIngredient.nutritionPerUnit.calories);
    
    // Update local state
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      name: selectedIngredient.name,
      calories: selectedIngredient.nutritionPerUnit.calories,
    };
    setIngredients(updatedIngredients);
  };

  // Handle cooking method selection
  const handleCookingMethodChange = async (cookingMethodName: string, index: number) => {
    const selectedIngredient = watchedIngredients[index];
    const baseCalories = selectedIngredient.calories || 0;
    
    // Find the multiplier for this cooking method
    let adjustedCalories = baseCalories;
    
    if (Array.isArray(cookingMethods) && cookingMethods.length > 0) {
      // Check if cookingMethods is an array of objects or strings
      if (typeof cookingMethods[0] === 'string') {
        // Using default multipliers for string-based cooking methods
        const multipliers: Record<string, number> = {
          "Raw": 1.0,
          "Boiled": 0.95,
          "Steamed": 0.9,
          "Fried": 1.5,
          "Grilled": 1.2,
          "Baked": 1.1,
          "Roasted": 1.3,
          "Sautéed": 1.4
        };
        adjustedCalories = Math.round(baseCalories * (multipliers[cookingMethodName] || 1.0));
      } else {
        // Using API-provided cooking methods with multipliers
        const method = cookingMethods.find((m: any) => 
          typeof m === 'object' && m.name === cookingMethodName);
        if (method && typeof method === 'object' && 'calorieMultiplier' in method) {
          adjustedCalories = Math.round(baseCalories * method.calorieMultiplier);
        }
      }
    }
    
    // Update the form
    form.setValue(`ingredients.${index}.cookingMethod`, cookingMethodName);
    form.setValue(`ingredients.${index}.calories`, adjustedCalories);
    
    // Update local state
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      cookingMethod: cookingMethodName,
      calories: adjustedCalories,
    };
    setIngredients(updatedIngredients);
  };

  // Handle pre-made meal selection
  const handlePremadeMealSelect = async (mealId: string) => {
    const selected = premadeMeals.find(meal => meal.id.toString() === mealId);
    if (!selected) return;
    
    setSelectedPremadeMeal(selected);
    
    // Update the form with the pre-made meal details
    form.setValue('name', selected.name);
    form.setValue('recipe.name', selected.name);
    form.setValue('recipe.calories', selected.totalNutrition.calories);
    form.setValue('recipe.servingSize', '1 serving');
    
    // Set total calories
    setTotalCalories(selected.totalNutrition.calories);
  };

  // Add a new ingredient to the form
  const addIngredient = () => {
    setIngredients([...ingredients, { ...defaultIngredient }]);
    const currentIngredients = form.getValues("ingredients") || [];
    form.setValue("ingredients", [...currentIngredients, { ...defaultIngredient }]);
  };
  
  // Remove an ingredient from the form
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
    form.setValue("ingredients", updatedIngredients);
  };
  
  // Apply suggested pre-made meal
  const applySuggestedMeal = () => {
    if (!suggestedMeal) return;
    
    handlePremadeMealSelect(suggestedMeal.id.toString());
    form.setValue('inputMethod', 'recipe');
    setShowPremadeMealSuggestion(false);
  };
  
  // Form submission handler
  const onSubmit = (values: MealFormValues) => {
    setIsSaving(true);
    
    // Calculate total calories for the meal
    let totalCaloriesValue = 0;
    
    if (values.inputMethod === 'ingredients' && values.ingredients) {
      totalCaloriesValue = values.ingredients.reduce((sum, ing) => sum + (ing.calories || 0), 0);
    } else if (values.inputMethod === 'recipe' && values.recipe) {
      totalCaloriesValue = values.recipe.calories;
    }
    
    // Prepare data for submission
    const mealData = {
      name: values.name,
      mealType: values.mealType,
      date: values.date,
      time: values.time,
      calories: totalCaloriesValue,
      ingredients: values.inputMethod === 'ingredients' 
        ? values.ingredients 
        : selectedPremadeMeal 
          ? selectedPremadeMeal.ingredients.map(ing => {
              const ingredient = ingredientOptions.find(i => i.id === ing.ingredientId);
              return {
                name: ingredient?.name || 'Unknown',
                quantity: `${ing.quantity} ${ingredient?.unit || ''}`,
                calories: ingredient?.nutritionPerUnit.calories || 0,
                cookingMethod: ing.cookingMethodId 
                  ? cookingMethods.find(m => m.id === ing.cookingMethodId)?.name 
                  : undefined
              };
            })
          : [],
    };
    
    // Submit to API
    createMealMutation.mutate(mealData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter meal name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="inputMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add meal by</FormLabel>
              <div className="flex space-x-4">
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    <label 
                      className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm cursor-pointer ${field.value === 'ingredients' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`} 
                      onClick={() => field.onChange("ingredients")}
                    >
                      Ingredients
                    </label>
                    <label 
                      className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm cursor-pointer ${field.value === 'recipe' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`} 
                      onClick={() => field.onChange("recipe")}
                    >
                      Recipe
                    </label>
                  </div>
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        
        {inputMethod === "ingredients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Ingredients</h3>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
            
            {ingredients.map((_, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Ingredient {index + 1}</h4>
                  {ingredients.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 h-8 px-2"
                      onClick={() => removeIngredient(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chicken breast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100g" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.cookingMethod`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Cooking Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cookingMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.calories`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Calories</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="kcal" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {inputMethod === "recipe" && (
          <div className="space-y-4 p-3 border rounded-md">
            <h3 className="text-sm font-medium">Recipe Details</h3>
            
            <FormField
              control={form.control}
              name="recipe.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicken Stir Fry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="recipe.servingSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Serving Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 cup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipe.calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="kcal" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Meal</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Edit meal form component
const EditMealForm = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => {
  const [ingredients, setIngredients] = useState(
    meal.ingredients.map(ing => ({
      name: ing.name,
      quantity: ing.quantity,
      calories: ing.calories,
      cookingMethod: ing.cookingMethod || "Raw"
    }))
  );
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      name: meal.name,
      mealType: meal.mealType,
      date: meal.date,
      time: meal.time,
      inputMethod: "ingredients",
      ingredients: meal.ingredients.map(ing => ({
        name: ing.name,
        quantity: ing.quantity,
        calories: ing.calories,
        cookingMethod: ing.cookingMethod || "Raw"
      })),
      recipe: {
        name: "",
        servingSize: "",
        calories: 0
      }
    },
  });

  const inputMethod = form.watch("inputMethod");
  
  const addIngredient = () => {
    setIngredients([...ingredients, { ...defaultIngredient }]);
    const currentIngredients = form.getValues("ingredients") || [];
    form.setValue("ingredients", [...currentIngredients, { ...defaultIngredient }]);
  };
  
  const removeIngredient = (index: number) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients.splice(index, 1);
    setIngredients(updatedIngredients);
    form.setValue("ingredients", updatedIngredients);
  };
  
  const onSubmit = (values: MealFormValues) => {
    console.log("Form updated:", values);
    // Here you would normally update the meal via API
    onClose();
  };
  
  // Set the button text appropriately for editing

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter meal name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mealType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select meal type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="inputMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Add meal by</FormLabel>
              <div className="flex space-x-4">
                <FormControl>
                  <div className="grid grid-cols-2 gap-2">
                    <label 
                      className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm cursor-pointer ${field.value === 'ingredients' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`} 
                      onClick={() => field.onChange("ingredients")}
                    >
                      Ingredients
                    </label>
                    <label 
                      className={`flex items-center justify-center px-3 py-2 border rounded-md text-sm cursor-pointer ${field.value === 'recipe' ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300'}`} 
                      onClick={() => field.onChange("recipe")}
                    >
                      Recipe
                    </label>
                  </div>
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        
        {inputMethod === "ingredients" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Ingredients</h3>
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
            
            {ingredients.map((_, index) => (
              <div key={index} className="p-3 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Ingredient {index + 1}</h4>
                  {ingredients.length > 1 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 h-8 px-2"
                      onClick={() => removeIngredient(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Chicken breast" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Quantity</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 100g" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.cookingMethod`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Cooking Method</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cookingMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.calories`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Calories</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="kcal" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {inputMethod === "recipe" && (
          <div className="space-y-4 p-3 border rounded-md">
            <h3 className="text-sm font-medium">Recipe Details</h3>
            
            <FormField
              control={form.control}
              name="recipe.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Recipe Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chicken Stir Fry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="recipe.servingSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Serving Size</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 cup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="recipe.calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Calories</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="kcal" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Update Meal</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Main meals page component
export default function MealsPage() {
  const { user } = useAuth();
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const [isEditMealOpen, setIsEditMealOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  
  // Fetching meals data
  const { 
    data: meals = [], 
    isLoading, 
    error 
  } = useQuery<Meal[]>({
    queryKey: ["/api/meals"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!user
  });
  
  // Mock data for demonstration
  const [mealsList, setMealsList] = useState<Meal[]>([
    {
      id: 1,
      name: "Morning Oatmeal",
      mealType: "Breakfast",
      time: "8:30 AM",
      calories: 320,
      ingredients: [
        { name: "Oatmeal", quantity: "1 cup", calories: 150, cookingMethod: "Boiled" },
        { name: "Banana", quantity: "1 medium", calories: 105, cookingMethod: "Raw" },
        { name: "Honey", quantity: "1 tbsp", calories: 65, cookingMethod: "Raw" }
      ],
      date: "2023-04-15"
    },
    {
      id: 2,
      name: "Grilled Chicken Salad",
      mealType: "Lunch",
      time: "12:45 PM",
      calories: 410,
      ingredients: [
        { name: "Chicken Breast", quantity: "150g", cookingMethod: "Grilled", calories: 230 },
        { name: "Mixed Greens", quantity: "2 cups", calories: 30, cookingMethod: "Raw" },
        { name: "Cherry Tomatoes", quantity: "1/2 cup", calories: 25, cookingMethod: "Raw" },
        { name: "Olive Oil", quantity: "1 tbsp", calories: 120, cookingMethod: "Raw" },
        { name: "Balsamic Vinegar", quantity: "1 tbsp", calories: 5, cookingMethod: "Raw" }
      ],
      date: "2023-04-15"
    },
    {
      id: 3,
      name: "Baked Salmon Dinner",
      mealType: "Dinner",
      time: "7:30 PM",
      calories: 520,
      ingredients: [
        { name: "Salmon Fillet", quantity: "200g", cookingMethod: "Baked", calories: 350 },
        { name: "Asparagus", quantity: "100g", cookingMethod: "Steamed", calories: 40 },
        { name: "Sweet Potato", quantity: "150g", cookingMethod: "Roasted", calories: 130 }
      ],
      date: "2023-04-15"
    }
  ]);
  
  const handleEditMeal = (meal: Meal) => {
    setCurrentMeal(meal);
    setIsEditMealOpen(true);
  };
  
  const handleDeleteMeal = (id: number) => {
    if (confirm("Are you sure you want to delete this meal?")) {
      setMealsList(mealsList.filter(meal => meal.id !== id));
    }
  };
  
  const displayMeals = mealsList.filter(meal => 
    meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meal.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meals</h1>
            
            <Dialog open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add a New Meal</DialogTitle>
                  <DialogDescription>
                    Track your food intake by adding meal details.
                  </DialogDescription>
                </DialogHeader>
                <AddMealForm onClose={() => setIsAddMealOpen(false)} />
              </DialogContent>
            </Dialog>
            
            {/* Edit Meal Dialog */}
            <Dialog open={isEditMealOpen && !!currentMeal} onOpenChange={setIsEditMealOpen}>
              <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Meal</DialogTitle>
                  <DialogDescription>
                    Update your meal information.
                  </DialogDescription>
                </DialogHeader>
                {currentMeal && <EditMealForm meal={currentMeal} onClose={() => setIsEditMealOpen(false)} />}
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search meals or ingredients..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="today" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium">Failed to load meals</h3>
                  <p className="text-gray-500">Please try again later</p>
                </div>
              ) : displayMeals.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <p className="text-gray-500 mb-4">No meals found for today</p>
                  <Button onClick={() => setIsAddMealOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Meal
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-medium mb-2">Today's Meals</h2>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <Card className="flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="text-sm font-medium text-gray-500">Total Calories</h3>
                        <p className="text-3xl font-bold">{displayMeals.reduce((sum, meal) => sum + meal.calories, 0)}</p>
                        <p className="text-xs text-gray-500">kcal</p>
                      </Card>
                      <Card className="flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="text-sm font-medium text-gray-500">Protein</h3>
                        <p className="text-3xl font-bold">65</p>
                        <p className="text-xs text-gray-500">g</p>
                      </Card>
                      <Card className="flex flex-col items-center justify-center p-4 text-center">
                        <h3 className="text-sm font-medium text-gray-500">Meals</h3>
                        <p className="text-3xl font-bold">{displayMeals.length}</p>
                        <p className="text-xs text-gray-500">today</p>
                      </Card>
                    </div>
                  </div>
                  
                  <div>
                    {displayMeals.map(meal => (
                      <MealItem 
                        key={meal.id} 
                        meal={meal} 
                        onEdit={handleEditMeal}
                        onDelete={handleDeleteMeal}
                      />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="week">
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-gray-500">Weekly meal summary coming soon</p>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="flex flex-col items-center py-10 text-center">
                <p className="text-gray-500">Meal history and trends coming soon</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}