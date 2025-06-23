import { inject, Injectable } from '@angular/core';
import { from, mergeMap, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserSettingsService } from './user-settings.service';
import { Meal } from '../data/interfaces/meals/meal';
import { MealGenerationService } from './meal-generation.service';
import { of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {
  private userSettingsService = inject(UserSettingsService);
  private mealGenerationService = inject(MealGenerationService);
  private readonly apiUrl = environment.apiUrl;

  constructor() { }

  /**
   * Send a chat message to the backend (ChatGPT) and receive a response.
   * Optionally updates meals if the response includes meal data.
   * @param message - The user's chat message
   * @param userSettings - The user's settings (optional, for context)
   */
  sendChatMessage(message: string, existingMeals: Meal[]): Observable<any> {
    const url = `${this.apiUrl}/api/generate`;
    const userSettings = this.userSettingsService.getSavedUserSettings();
    const requestBody: any = {
      userSettings: userSettings,
      message: message,
      existingMeals: existingMeals
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
      mergeMap((data: any) => {
        // If the response includes meals, update local storage and generate image using MealGenerationService
        if (data.meals && data.meals.meal) {
          const meal = this.mealGenerationService['transformApiResponse'](data);
          return this.mealGenerationService.generateMealImage(meal).pipe(
            map((image: string) => {
              meal.image = image;
              this.mealGenerationService.saveMealToStorage(meal);
              return meal;
            })
          );
        }
        return of(data);
      }),
      catchError(error => {
        console.error('Error sending chat message:', error);
        return throwError(() => new Error('Failed to send chat message. Please try again.'));
      })
    );
  }
}
