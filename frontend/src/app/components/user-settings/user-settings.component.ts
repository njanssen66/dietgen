import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MealGenerationService, UserSettings, Meal } from '../../services/meal-generation.service';

const LOCAL_STORAGE_KEY = 'dietllm-user-settings';

@Component({
  selector: 'app-user-settings',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css'
})
export class UserSettingsComponent implements OnInit {
  userForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  generatedMeal: Meal | null = null;

  activityDescriptions: { [key: string]: string } = {
    'Sedentary': 'Little or no exercise, desk job, minimal movement throughout the day.',
    'Moderate': 'Light exercise or sports 1-3 days/week, or a job with some movement.',
    'Active': 'Hard exercise or sports 3+ days/week, or a physically demanding job.'
  };

  goalOptions = [
    'lose weight',
    'maintain weight', 
    'gain weight',
    'build muscle'
  ];

  constructor(
    private fb: FormBuilder,
    private mealGenerationService: MealGenerationService
  ) {
    this.userForm = this.fb.group({
      age: ['', [Validators.required, Validators.min(13), Validators.max(120)]],
      gender: ['', Validators.required],
      weight: ['', [Validators.required, Validators.min(30), Validators.max(500)]],
      weightUnit: ['kg'],
      height: ['', [Validators.required, Validators.min(100), Validators.max(250)]],
      heightUnit: ['cm'],
      activity: ['', Validators.required],
      goal: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Load from local storage if available
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const savedSettings = JSON.parse(saved);
        this.userForm.patchValue(savedSettings);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }

    // Save to local storage on any change
    this.userForm.valueChanges.subscribe(val => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));
    });
  }

  get activityDescription(): string {
    const activity = this.userForm.get('activity')?.value;
    return this.activityDescriptions[activity] || '';
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.generatedMeal = null;

    try {
      const userSettings = this.userForm.value as UserSettings;
      
      this.mealGenerationService.generateMealPlan(userSettings).forEach(meal => {
        meal.subscribe({
          next: (meal: Meal) => {
            this.generatedMeal = meal;
            this.mealGenerationService.saveMealToStorage(meal);
            this.isLoading = false;
          }
        });
      });
    } catch (error) {
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
    }
  }

  resetForm() {
    this.userForm.reset({
      weightUnit: 'kg',
      heightUnit: 'cm'
    });
    this.generatedMeal = null;
    this.errorMessage = '';
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
}
