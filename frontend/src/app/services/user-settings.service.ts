import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { UserSettings } from "../data/interfaces/user-settings";

@Injectable({
    providedIn: 'root'
})
export class UserSettingsService {
    private userSettingsSubject = new BehaviorSubject<UserSettings | null>(null);
    userSettings$ = this.userSettingsSubject.asObservable();

    constructor() {
        this.userSettingsSubject.next(this.getSavedUserSettings());
    }

    getSavedUserSettings(): UserSettings | null {
        const saved = localStorage.getItem('dietllm-user-settings');
        return saved ? JSON.parse(saved) : null;
    }

    saveUserSettings(userSettings: UserSettings): void {
        localStorage.setItem('dietllm-user-settings', JSON.stringify(userSettings));
        this.userSettingsSubject.next(userSettings);
    }

    clearUserSettings(): void {
        localStorage.removeItem('dietllm-user-settings');
        this.userSettingsSubject.next(null);
    }
}