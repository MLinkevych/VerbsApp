// Helper functions for progress calculations
import { Category, UserProgress, Video, Question, QuizAttempt } from '../types';

// Normalization and aliasing utilities
const normalize = (s?: string) => String(s ?? '').trim().toLowerCase();

const ALIAS: Record<string, string> = {
  // canonical
  eat: 'eat',
  drink: 'drink',
  sleep: 'sleep',
  open: 'open',
  draw: 'draw',
  // friendly variants
  eating: 'eat',
  food: 'eat',
  feeding: 'eat',
  drinking: 'drink',
  beverage: 'drink',
  sleeping: 'sleep',
  rest: 'sleep',
  opening: 'open',
  opened: 'open',
  drawing: 'draw',
  sketch: 'draw',
};

export const canon = (s?: string) => ALIAS[normalize(s)] ?? normalize(s);

// Create video lookup maps
export const createVideoIdsByCategory = (allVideos: Video[]): Map<string, Set<string>> => {
  const map = new Map<string, Set<string>>();
  allVideos.forEach(v => {
    const key = canon(v.categoryId);
    if (!map.has(key)) map.set(key, new Set<string>());
    map.get(key)!.add(v.id);
  });
  return map;
};

// Create question lookup map
export const createQuestionById = (allQuestions: Question[]): Map<string, Question> => {
  const map = new Map<string, Question>();
  allQuestions.forEach(q => map.set(q.id, q));
  return map;
};

// Calculate video progress for a category
export const calculateCategoryVideoPercentage = (
  categoryId: string,
  videoIdsByCategory: Map<string, Set<string>>,
  userProgress: UserProgress[]
): number => {
  const key = canon(categoryId);
  const idsInCategory = videoIdsByCategory.get(key);
  const progress = userProgress.find(p => p.categoryId === categoryId);

  if (!idsInCategory || idsInCategory.size === 0 || !progress) return 0;

  const uniqueWatchedInCategory = new Set(
    (progress.videosWatched || []).filter(id => idsInCategory.has(id))
  ).size;

  return (uniqueWatchedInCategory / idsInCategory.size) * 100;
};

// Get video watch counts for a category
export const getVideoWatchCounts = (
  categoryId: string,
  allVideos: Video[],
  userProgress: UserProgress[]
): { [videoId: string]: { title: string; count: number } } => {
  const key = canon(categoryId);
  const watchCounts: { [videoId: string]: { title: string; count: number } } = {};

  // Initialize all category videos at 0
  allVideos.forEach(v => {
    if (canon(v.categoryId) === key) {
      watchCounts[v.id] = { title: v.title, count: 0 };
    }
  });

  const progress = userProgress.find(p => p.categoryId === categoryId);
  if (progress?.videosWatched) {
    progress.videosWatched.forEach(id => {
      if (watchCounts[id]) watchCounts[id].count++;
    });
  }

  return watchCounts;
};

// Calculate quiz statistics for a category
export const calculateCategoryQuizStats = (
  categoryId: string,
  userProgress: UserProgress[],
  questionById: Map<string, Question>
) => {
  const key = canon(categoryId);

  // Collect ALL quiz attempts from ALL UserProgress records for this user
  const allAttempts: QuizAttempt[] = [];
  userProgress.forEach(progress => {
    if (progress.quizAttempts?.length) {
      allAttempts.push(...progress.quizAttempts);
    }
  });

  if (!allAttempts.length) {
    return { correctAnswers: 0, totalQuestions: 0, sufficiency: 0, questionsAnswered: 0 };
  }

  // Filter attempts for this category from ALL attempts
  const attemptsForCategory = allAttempts.filter(a => {
    const attemptCat = a.categoryId ? canon(a.categoryId) : undefined;
    if (attemptCat) return attemptCat === key;

    const q = questionById.get(a.questionId);
    if (!q) {
      console.warn('Unmatched attempt (questionId missing in allQuestions):', a.questionId);
      return false;
    }
    return canon(q.categoryId) === key;
  });

  const totalAttempts = attemptsForCategory.length;
  const correctAnswers = attemptsForCategory.reduce((acc, a) => acc + (a.isCorrect ? 1 : 0), 0);

  return {
    correctAnswers,
    totalQuestions: totalAttempts,
    sufficiency: totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0,
    questionsAnswered: totalAttempts,
  };
};

// Validate quiz attempts data integrity
export const validateQuizAttempts = (allQuestions: Question[], userProgress: UserProgress[]) => {
  if (!allQuestions.length || !userProgress.length) return;
  
  const known = new Set(allQuestions.map(q => q.id));
  const missing = new Set<string>();
  
  userProgress.forEach(p =>
    (p.quizAttempts ?? []).forEach(a => {
      if (!a.categoryId && !known.has(a.questionId)) missing.add(a.questionId);
    })
  );
  
  if (missing.size) {
    console.warn(
      'Quiz attempts reference questionIds not present in getAllQuestions (and no categoryId on attempt):',
      Array.from(missing)
    );
  }
};
