export interface Recipe {
  id: number;
  userId: number;
  title: string;
  description?: string;
  instructions: string;
  cookTimeMinutes?: number;
  ingredients: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}
