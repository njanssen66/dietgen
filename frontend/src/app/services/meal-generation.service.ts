import { Injectable } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserSettings {
  age: number;
  gender: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  height: number;
  heightUnit: 'cm' | 'in';
  activity: 'Sedentary' | 'Moderate' | 'Active';
  goal: 'lose weight' | 'maintain weight' | 'gain weight' | 'build muscle';
}

export interface Meal {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

@Injectable({
  providedIn: 'root'
})
export class MealGenerationService {
  private readonly apiUrl = environment.apiUrl;

  private savedMealsSubject = new BehaviorSubject<Meal[]>(this.getSavedMeals());
  savedMeals$ = this.savedMealsSubject.asObservable();

  constructor() { }

  /**
   * Generate a meal plan as an array of Observables, one for each meal type.
   * @param userSettings - The user's settings
   * @returns Observable<Meal>[] - Array of Observables for each meal type
   */
  generateMealPlan(userSettings: UserSettings): Observable<Meal>[] {
    return [
      this.generateMeal(userSettings, 'breakfast'),
      this.generateMeal(userSettings, 'lunch'),
      this.generateMeal(userSettings, 'dinner'),
      this.generateMeal(userSettings, 'snack')
    ];
  }

  /**
   * Generate a meal based on user settings and meal type (mealSettings)
   * @param userSettings - The user's settings
   * @param mealSettings - The type of meal to generate ('breakfast' | 'lunch' | 'dinner' | 'snack')
   */
  generateMeal(
    userSettings: UserSettings,
    mealSettings?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ): Observable<Meal> {
    const url = `${this.apiUrl}/api/generate`;

    const existingMeals = this.getSavedMeals();
    
    // Merge mealSettings and existingMeals into the request body if provided
    const requestBody = {
      ...userSettings,
      ...(mealSettings ? { mealType: mealSettings } : {}),
      ...(existingMeals ? { existingMeals } : {})
    };

    return from(fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })).pipe(
      mergeMap(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      }),
      map((data: any) => this.transformApiResponse(data)),
      catchError(error => {
        console.error('Error generating meal plan:', error);
        return throwError(() => new Error('Failed to generate meal plan. Please try again.'));
      })
    );
  }

  /**
   * Transform API response to our internal format
   */
  private transformApiResponse(data: any): Meal {
    // Transform the raw API response to our MealPlan interface
    // This assumes the API returns a structure that can be mapped
    return {
      id: data.id || this.generateId(),
      name: data.meals.meal.name,
      ingredients: data.meals.meal.ingredients,
      instructions: data.meals.meal.instructions,
      type: data.meals.meal.type
    };
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Save meal plan to local storage
   */
  saveMealToStorage(meal: Meal): void {
    const savedMeals = this.getSavedMeals();
    savedMeals.unshift(meal);
    
    // Keep only the last 4 meals
    if (savedMeals.length > 4) {
      savedMeals.splice(4);
    }
    
    localStorage.setItem('dietgen-saved-meal-plans', JSON.stringify(savedMeals));
    this.savedMealsSubject.next(savedMeals);
  }

  /**
   * Get saved meal plans from local storage
   */
  getSavedMeals(): Meal[] {
    const saved = localStorage.getItem('dietgen-saved-meal-plans');
    if (!saved) return [];
    
    try {
      const meals = JSON.parse(saved);
      return meals;
    } catch (error) {
      console.error('Error parsing saved meal plans:', error);
      return [];
    }
  }

  /**
   * Clear saved meal plans
   */
  clearSavedMealPlans(): void {
    localStorage.removeItem('dietgen-saved-meal-plans');
    this.savedMealsSubject.next([]);
  }
} 