import { Component, OnDestroy } from '@angular/core';
import { Meal, MealGenerationService } from '../../services/meal-generation.service';
import { NgIf, NgFor } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-meal-list',
  imports: [
    NgIf,
    NgFor
  ],
  templateUrl: './meal-list.component.html',
  styleUrl: './meal-list.component.css'
})
export class MealListComponent implements OnDestroy {
  meals: Meal[] = [];
  private mealPlansSub: Subscription;
  
  constructor(private mealGenerationService: MealGenerationService) {
    this.mealPlansSub = this.mealGenerationService.savedMealPlans$.subscribe(plans => {
      console.log(plans);
      this.meals = plans.length > 0 ? plans[0].meals : [];
    });
  }

  ngOnDestroy() {
    this.mealPlansSub.unsubscribe();
  }
}
