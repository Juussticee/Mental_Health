import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";

type AddMealModalProps = {
  onClose: () => void;
};

export default function AddMealModal({ onClose }: AddMealModalProps) {
  const [mealName, setMealName] = useState("");
  const [category, setCategory] = useState("breakfast");
  const [ingredients, setIngredients] = useState<{ name: string; quantity: string }[]>([
    { name: "Chicken breast", quantity: "150g" },
    { name: "Mixed greens", quantity: "100g" }
  ]);
  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: "" });
  
  const handleAddIngredient = () => {
    if (newIngredient.name && newIngredient.quantity) {
      setIngredients([...ingredients, { ...newIngredient }]);
      setNewIngredient({ name: "", quantity: "" });
    }
  };
  
  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  
  const handleSave = () => {
    // In a real app, this would save to API
    console.log("Saving meal:", { mealName, category, ingredients });
    onClose();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Add Meal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input 
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g., Grilled Chicken Salad"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Ingredients</Label>
            <div className="border border-gray-300 rounded-md p-2 mb-2 mt-1">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between py-1">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-800">{ingredient.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{ingredient.quantity}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleRemoveIngredient(index)}
                    className="text-gray-400 hover:text-red-500 p-0 h-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Add ingredient"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Qty"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                className="w-20"
              />
              <Button 
                variant="outline"
                onClick={handleAddIngredient}
                className="bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-white hover:bg-blue-600"
          >
            Save Meal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
