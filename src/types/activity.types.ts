export interface ExerciseLog {
    id: string;
    userId: string;

    exerciseName: string;
    durationMinutes: number;
    caloriesBurned: number;

    performedAt: Date;
    createdAt: Date;

    source: 'manual' | 'apple_health' | 'google_fit' | 'fitbit';
}

export interface WaterLog {
    id: string;
    userId: string;

    amountMl: number;

    consumedAt: Date;
    createdAt: Date;
}