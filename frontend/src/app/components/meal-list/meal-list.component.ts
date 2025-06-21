import { Component, OnDestroy } from '@angular/core';
import { Meal, MealGenerationService } from '../../services/meal-generation.service';
import { NgFor } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-meal-list',
  imports: [
    NgFor
  ],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.css'
})
export class MealListComponent implements OnDestroy {
  meals: Meal[] = [];
  private mealPlansSub: Subscription;
  
  constructor(private mealGenerationService: MealGenerationService) {
    this.mealPlansSub = this.mealGenerationService.savedMeals$.subscribe(meals => {
      this.meals = meals;
    });
  }

  ngOnDestroy() {
    this.mealPlansSub.unsubscribe();
  }
}
