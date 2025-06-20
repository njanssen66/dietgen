import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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

  activityDescriptions: { [key: string]: string } = {
    'Sedentary': 'Little or no exercise, desk job, minimal movement throughout the day.',
    'Moderate': 'Light exercise or sports 1-3 days/week, or a job with some movement.',
    'Active': 'Hard exercise or sports 3+ days/week, or a physically demanding job.'
  };

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      age: [''],
      gender: [''],
      weight: [''],
      weightUnit: ['kg'],
      height: [''],
      heightUnit: ['cm'],
      activity: [''],
      goal: ['']
    });
  }

  ngOnInit(): void {
    // Load from local storage if available
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      this.userForm.patchValue(JSON.parse(saved));
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
    const url = `${environment.apiUrl}/api/generate`;
    const body = this.userForm.value;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    const data = await response.json();
    console.log(data);
    alert('Settings saved and meals will be generated!');
    // Optionally, trigger meal generation here
  }
}
