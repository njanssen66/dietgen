import { Injectable } from '@angular/core';
import { Observable, from, throwError, BehaviorSubject } from 'rxjs';
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

export interface MealPlan {
  id: string;
  generatedAt: Date;
  meals: Meal[];
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

  private savedMealPlansSubject = new BehaviorSubject<MealPlan[]>(this.getSavedMealPlans());
  savedMealPlans$ = this.savedMealPlansSubject.asObservable();

  constructor() { }

  /**
   * Generate a meal plan based on user settings
   */
  generateMealPlan(userSettings: UserSettings): Observable<MealPlan> {
    const url = `${this.apiUrl}/api/generate`;
    
    return from(fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userSettings)
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
  private transformApiResponse(data: any): MealPlan {
    // Transform the raw API response to our MealPlan interface
    // This assumes the API returns a structure that can be mapped
    return {
      id: data.id || this.generateId(),
      generatedAt: new Date(),
      meals: data.meals?.map((meal: any) => this.transformMeal(meal)) || [],
    };
  }

  /**
   * Transform individual meal data
   */
  private transformMeal(mealData: any): Meal {
    return {
      id: mealData.id || this.generateId(),
      name: mealData.name || 'Unnamed Meal',
      ingredients: mealData.ingredients || [],
      instructions: mealData.instructions || [],
      type: mealData.type || 'lunch'
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
  saveMealPlanToStorage(mealPlan: MealPlan): void {
    const savedPlans = this.getSavedMealPlans();
    savedPlans.unshift(mealPlan);
    
    // Keep only the last 1 meal plans
    if (savedPlans.length > 1) {
      savedPlans.splice(1);
    }
    
    localStorage.setItem('dietgen-saved-meal-plans', JSON.stringify(savedPlans));
    this.savedMealPlansSubject.next(savedPlans);
  }

  /**
   * Get saved meal plans from local storage
   */
  getSavedMealPlans(): MealPlan[] {
    const saved = localStorage.getItem('dietgen-saved-meal-plans');
    if (!saved) return [];
    
    try {
      const plans = JSON.parse(saved);
      return plans.map((plan: any) => ({
        ...plan,
        generatedAt: new Date(plan.generatedAt)
      }));
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
    this.savedMealPlansSubject.next([]);
  }
} 