import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Category, UserProgress, User, Video, Question } from '../types';
import dataService from '../utils/dataService';
import {
  createVideoIdsByCategory,
  createQuestionById,
  validateQuizAttempts,
  calculateCategoryVideoPercentage,
  getVideoWatchCounts,
  calculateCategoryQuizStats
} from '../utils/progressHelpers';

export const useProgressData = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [categories, setCategories] = useState<Category[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacherView, setIsTeacherView] = useState(false);

  // Create lookup maps for performance
  const questionById = useMemo(() => createQuestionById(allQuestions), [allQuestions]);
  const videoIdsByCategory = useMemo(() => createVideoIdsByCategory(allVideos), [allVideos]);

  // Validate data integrity
  useEffect(() => {
    validateQuizAttempts(allQuestions, userProgress);
  }, [allQuestions, userProgress]);

  // Load progress data
  const loadProgressData = useCallback(async () => {
    try {
      const routeParams = route.params as any;
      const targetStudentId = routeParams?.studentId;

      let user: User | null = null;

      if (targetStudentId) {
        const allUsers = await dataService.getUsers();
        user = allUsers.find(u => u.id === targetStudentId) || null;
        setIsTeacherView(true);
      } else {
        user = await dataService.getCurrentUser();
        try {
          const currentTeacher = await dataService.getCurrentTeacher();
          setIsTeacherView(currentTeacher !== null);
        } catch {
          setIsTeacherView(false);
        }
      }

      setCurrentUser(user);

      const [categoriesData, progressData, videosData, questionsData] = await Promise.all([
        dataService.getCategories(),
        user ? dataService.getUserProgress(user.id) : Promise.resolve([]),
        dataService.getAllVideos(),
        dataService.getAllQuestions(),
      ]);

      setCategories(categoriesData);
      setUserProgress(progressData);
      setAllVideos(videosData);
      setAllQuestions(questionsData);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  }, [route.params]);

  // Initial load and parameter-driven reload
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Refresh when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProgressData);
    return unsubscribe;
  }, [navigation, loadProgressData]);

  // Create calculation functions with current data
  const calculateVideoPercentage = useCallback(
    (categoryId: string) => calculateCategoryVideoPercentage(categoryId, videoIdsByCategory, userProgress),
    [videoIdsByCategory, userProgress]
  );

  const getWatchCounts = useCallback(
    (categoryId: string) => getVideoWatchCounts(categoryId, allVideos, userProgress),
    [allVideos, userProgress]
  );

  const calculateQuizStats = useCallback(
    (categoryId: string) => calculateCategoryQuizStats(categoryId, userProgress, questionById),
    [userProgress, questionById]
  );

  return {
    // State
    categories,
    currentUser,
    loading,
    isTeacherView,
    
    // Functions
    calculateVideoPercentage,
    getWatchCounts,
    calculateQuizStats,
    
    // Raw data (if needed)
    userProgress,
    allVideos,
    allQuestions,
  };
};






