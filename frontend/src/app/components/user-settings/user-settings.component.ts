import { Component, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { MealGenerationService } from '../../services/meal-generation.service';
import { UserSettings } from '../../data/interfaces/user-settings';
import { Meal } from '../../data/interfaces/meals/meal';
import { UserSettingsService } from '../../services/user-settings.service';

@Component({
  selector: 'app-user-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './user-settings.component.html',
  styleUrl: './user-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserSettingsComponent {
  private fb = inject(FormBuilder);
  private mealGenerationService = inject(MealGenerationService);
  private userSettingsService = inject(UserSettingsService);

  // Use signal for form state
  userForm = signal<FormGroup>(this.fb.group({
    age: [null, [Validators.required, Validators.min(13), Validators.max(120)]],
    gender: [null, Validators.required],
    weight: [null, [Validators.required, Validators.min(30), Validators.max(500)]],
    weightUnit: ['kg'],
    height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
    heightUnit: ['cm'],
    activity: [null, Validators.required],
    goal: [null, Validators.required],
    favouriteFoods: [''],
    dislikedFoods: [''],
    additionalInfo: ['']
  }));

  isLoading = signal(false);
  errorMessage = signal('');

  readonly activityDescriptions: { [key: string]: string } = {
    'Sedentary': 'Little or no exercise, desk job, minimal movement throughout the day.',
    'Moderate': 'Light exercise or sports 1-3 days/week, or a job with some movement.',
    'Active': 'Hard exercise or sports 3+ days/week, or a physically demanding job.'
  };

  readonly goalOptions = [
    'lose weight',
    'maintain weight',
    'gain weight',
    'build muscle'
  ];

  // Use computed for derived state
  private activityValue = signal<string | null>(null);

  activityDescription = computed(() => {
    const activity = this.activityValue();
    return typeof activity === 'string' ? this.activityDescriptions[activity] || '' : '';
  });

  constructor() {
    // Patch form with user settings from service
    this.userSettingsService.userSettings$.subscribe(userSettings => {
      if (userSettings) {
        this.userForm().patchValue(userSettings);
      }
    });

    // Keep activityValue in sync with form
    effect(() => {
      const activityControl = this.userForm().get('activity');
      if (activityControl) {
        this.activityValue.set(activityControl.value);
        activityControl.valueChanges.subscribe((val: string) => {
          this.activityValue.set(val);
        });
      }
    });

    // Save to service on any change
    effect(() => {
      this.userForm().valueChanges.subscribe(val => {
        this.userSettingsService.saveUserSettings(val as UserSettings);
      });
    });
  }

  onSubmit() {
    if (this.userForm().invalid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    try {
      const raw = this.userForm().value;
      const userSettings: UserSettings = {
        age: Number(raw.age),
        gender: String(raw.gender),
        weight: Number(raw.weight),
        weightUnit: raw.weightUnit,
        height: Number(raw.height),
        heightUnit: raw.heightUnit,
        activity: raw.activity,
        goal: raw.goal,
        favouriteFoods: raw.favouriteFoods,
        dislikedFoods: raw.dislikedFoods,
        additionalInfo: raw.additionalInfo
      };

      this.mealGenerationService.generateMealPlan(userSettings).forEach(meal => {
        meal.subscribe({
          next: (meal: Meal) => {
            this.mealGenerationService.saveMealToStorage(meal);
            this.isLoading.set(false);
          },
          error: () => {
            this.errorMessage.set('An unexpected error occurred. Please try again.');
            this.isLoading.set(false);
          }
        });
      });
    } catch {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
      this.isLoading.set(false);
    }
  }

  resetForm() {
    this.userForm().reset({
      weightUnit: 'kg',
      heightUnit: 'cm',
      favouriteFoods: '',
      dislikedFoods: '',
      additionalInfo: ''
    });
    this.errorMessage.set('');
    this.userSettingsService.clearUserSettings();
  }
}
