import { Component, OnDestroy } from '@angular/core';
import { MealGenerationService } from '../../services/meal-generation.service';
import { NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { Meal } from '../../data/interfaces/meals/meal';

@Component({
  selector: 'app-meal-list',
  imports: [
    NgFor,
    NgIf  
  ],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.css'
})
export class MealListComponent implements OnDestroy {
  meals: Meal[] = [];
  private mealPlansSub: Subscription;
  expandedIndex: number | null = null;
  
  constructor(private mealGenerationService: MealGenerationService) {
    this.mealPlansSub = this.mealGenerationService.savedMeals$.subscribe(meals => {
      this.meals = meals;
    });
  }

  toggleRecipe(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  ngOnDestroy() {
    this.mealPlansSub.unsubscribe();
  }
}
