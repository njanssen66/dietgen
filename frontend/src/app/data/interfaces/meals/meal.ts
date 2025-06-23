export interface Meal {
    id: string;
    name: string;
    ingredients: string[];
    instructions: string[];
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    image?: string;
}