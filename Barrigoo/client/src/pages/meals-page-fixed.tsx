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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

// Ingredient type definition
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

// Cooking method type definition
type CookingMethod = {
  id: number;
  name: string;
  calorieMultiplier: number;
  description: string;
};

// Pre-made meal type definition
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

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const cookingMethods = ["Raw", "Boiled", "Steamed", "Fried", "Grilled", "Baked", "Roasted", "Sautéed"];

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
    const method = cookingMethods.find(m => m.name === cookingMethodName);
    if (!method) return;
    
    // Calculate adjusted calories based on cooking method
    const adjustedCalories = Math.round(baseCalories * method.calorieMultiplier);
    
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
                      Pre-made Meal
                    </label>
                  </div>
                </FormControl>
              </div>
            </FormItem>
          )}
        />
        
        {/* Show meal suggestion if found */}
        {showPremadeMealSuggestion && suggestedMeal && (
          <Alert className="bg-primary/5 border-primary/20">
            <Pizza className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-medium">We found a matching pre-made meal!</AlertTitle>
            <AlertDescription className="text-xs mt-1">
              <div className="mb-2">
                Looks like you're making <span className="font-medium">{suggestedMeal.name}</span>. 
                Would you like to use our pre-calculated nutritional information?
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                onClick={applySuggestedMeal}
              >
                Use pre-made meal
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
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
                        <div className="relative">
                          <FormControl>
                            <Input placeholder="e.g., Chicken breast" {...field} />
                          </FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm" 
                                className="absolute right-1 top-1 h-6 w-6 p-0"
                              >
                                <Search className="h-3 w-3" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-2">
                              <div className="space-y-2">
                                <h3 className="text-xs font-medium">Search Ingredients</h3>
                                <Input 
                                  placeholder="Type to search..." 
                                  value={searchQuery} 
                                  onChange={(e) => setSearchQuery(e.target.value)} 
                                  className="h-8 text-xs"
                                />
                                <div className="max-h-36 overflow-y-auto space-y-1">
                                  {isLoadingIngredients ? (
                                    <div className="flex items-center justify-center p-2">
                                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                  ) : formatIngredientOptions().length > 0 ? (
                                    formatIngredientOptions().map((option) => (
                                      <div 
                                        key={option.value}
                                        className="flex items-center justify-between p-1.5 text-xs rounded-md hover:bg-muted cursor-pointer"
                                        onClick={() => handleIngredientSelect(option.value, index)}
                                      >
                                        <span>{option.label}</span>
                                        <Check className={`h-3 w-3 ${field.value === option.label.split(' (')[0] ? 'text-primary' : 'text-transparent'}`} />
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-muted-foreground text-center p-2">No ingredients found</p>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
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
                          onValueChange={(value) => handleCookingMethodChange(value, index)}
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
                            value={field.value}
                            className="bg-gray-50"
                            readOnly
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            
            {/* Total calories display for ingredients */}
            <div className="mt-4 p-3 border rounded-md bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Calories</span>
                <span className="text-lg font-semibold">{totalCalories} kcal</span>
              </div>
            </div>
          </div>
        )}
        
        {inputMethod === "recipe" && (
          <div className="space-y-4">
            <FormItem>
              <FormLabel>Search Pre-made Meals</FormLabel>
              <div className="relative">
                <Input 
                  placeholder="Type to search..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="mb-2"
                />
                
                <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                  {isLoadingPremadeMeals ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : formatPremadeMealOptions().length > 0 ? (
                    formatPremadeMealOptions().map((option) => (
                      <div 
                        key={option.value}
                        className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer"
                        onClick={() => handlePremadeMealSelect(option.value)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{option.label.split(' (')[0]}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.label.split('(')[1]?.replace(')', '')}
                          </span>
                        </div>
                        <Check className={`h-4 w-4 ${selectedPremadeMeal?.id.toString() === option.value ? 'text-primary' : 'text-transparent'}`} />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No pre-made meals found</p>
                  )}
                </div>
              </div>
            </FormItem>
            
            {selectedPremadeMeal && (
              <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                <h3 className="text-sm font-medium">{selectedPremadeMeal.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-medium mb-1">Ingredients</h4>
                    <ul className="text-xs space-y-1">
                      {selectedPremadeMeal.ingredients.map((ing, idx) => {
                        const ingredient = ingredientOptions.find(i => i.id === ing.ingredientId);
                        const cookingMethod = ing.cookingMethodId 
                          ? cookingMethods.find(m => m.id === ing.cookingMethodId) 
                          : null;
                          
                        return (
                          <li key={idx} className="flex items-center">
                            <span>{ingredient?.name} ({ing.quantity} {ingredient?.unit})</span>
                            {cookingMethod && <span className="text-xs text-muted-foreground ml-1">- {cookingMethod?.name}</span>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium mb-1">Nutrition</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Calories:</span>
                        <span className="font-medium">{selectedPremadeMeal.totalNutrition.calories} kcal</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Protein:</span>
                        <span>{selectedPremadeMeal.totalNutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Carbs:</span>
                        <span>{selectedPremadeMeal.totalNutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Fat:</span>
                        <span>{selectedPremadeMeal.totalNutrition.fat}g</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : 'Add Meal'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

// Edit meal form component
const EditMealForm = ({ meal, onClose }: { meal: Meal, onClose: () => void }) => {
  const form = useForm<MealFormValues>({
    resolver: zodResolver(addMealSchema),
    defaultValues: {
      name: meal.name,
      mealType: meal.mealType,
      date: meal.date,
      time: meal.time,
      inputMethod: "ingredients",
      ingredients: meal.ingredients
    },
  });
  
  const onSubmit = (values: MealFormValues) => {
    console.log("Edit form submitted:", values);
    // Here you would normally update the meal via API
    onClose();
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
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Update Meal
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default function MealsPage() {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  // Fetch meals
  const { data: meals = [], isLoading } = useQuery<Meal[]>({
    queryKey: ['/api/meals'],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: number) => {
      await apiRequest('DELETE', `/api/meals/${mealId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/meals'] });
      toast({
        title: 'Meal deleted',
        description: 'The meal has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete meal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  const handleEditMeal = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteMeal = (mealId: number) => {
    deleteMealMutation.mutate(mealId);
  };
  
  // Filter meals based on search term and active tab
  const filteredMeals = meals.filter((meal: Meal) => {
    const matchesSearch = meal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || meal.mealType.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Meals & Recipes</h1>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Meal
            </Button>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search meals..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex-shrink-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                    <TabsTrigger value="lunch">Lunch</TabsTrigger>
                    <TabsTrigger value="dinner">Dinner</TabsTrigger>
                    <TabsTrigger value="snack">Snack</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : filteredMeals.length > 0 ? (
              <div>
                {filteredMeals.map((meal: Meal) => (
                  <MealItem
                    key={meal.id}
                    meal={meal}
                    onEdit={handleEditMeal}
                    onDelete={handleDeleteMeal}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900">No meals found</h3>
                <p className="text-gray-500 mt-1">
                  {searchTerm
                    ? `No meals matching "${searchTerm}"`
                    : activeTab !== "all"
                    ? `No ${activeTab} meals found`
                    : "You haven't added any meals yet"}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first meal
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Meal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Meal</DialogTitle>
            <DialogDescription>
              Add a new meal by entering ingredients or selecting a pre-made recipe.
            </DialogDescription>
          </DialogHeader>
          <AddMealForm onClose={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Meal Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Meal</DialogTitle>
            <DialogDescription>
              Edit the details of your meal.
            </DialogDescription>
          </DialogHeader>
          {selectedMeal && (
            <EditMealForm 
              meal={selectedMeal} 
              onClose={() => setIsEditModalOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}