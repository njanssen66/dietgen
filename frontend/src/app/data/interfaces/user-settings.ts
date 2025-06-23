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