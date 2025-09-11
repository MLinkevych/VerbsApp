export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  photo?: string; // Base64 image or local URI
  role: 'teacher' | 'student';
  teacherId?: string; // For students, links to their teacher
}

export interface Teacher extends User {
  role: 'teacher';
  password: string;
  students: string[]; // Array of student IDs
}

export interface Student extends User {
  role: 'student';
  teacherId: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  videoCount: number;
  unlocked: boolean;
}

export interface Video {
  id: string;
  categoryId: string;
  title: string;
  filename: string; // Local file path
  duration: number; // in seconds
  order: number; // Sequence order within category
}

export interface Question {
  id: string;
  videoId: string;
  categoryId: string;
  question: string;
  options: QuestionOption[];
  correctAnswer: string; // ID of correct option
  answerFormat: 'text' | 'icon';
}

export interface QuestionOption {
  id: string;
  text: string;
  icon?: string; // For icon-based answers
}

export interface UserProgress {
  userId: string;
  categoryId: string;
  videosWatched: string[]; // Array of video IDs
  completedAt?: Date;
  quizAttempts: QuizAttempt[];
  currentVideoIndex: number;
  hasCompletedSequence: boolean;
}

export interface QuizAttempt {
  id: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  attemptedAt: Date;
  timeTaken: number; // in seconds
  categoryId?: string; // Optional fallback for categorization
}

export interface SessionData {
  currentUser: User | null;
  selectedStudent?: Student; // For teachers viewing student progress
  currentCategory?: Category;
  currentVideo?: Video;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  StudentSelect: undefined;
  Categories: undefined;
  VideoSequence: { categoryId: string; startFromVideo?: string };
  VideoSelection: { categoryId: string };
  Quiz: { categoryId: string };
  Progress: { studentId?: string };
  TeacherDashboard: undefined;
  Settings: undefined;
};

export type BottomTabParamList = {
  Categories: undefined;
  Settings: undefined;
};
