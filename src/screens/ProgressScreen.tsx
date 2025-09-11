import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Category, UserProgress, User, Video, Question } from '../types';
import dataService from '../utils/dataService';

const { width } = Dimensions.get('window');

// Custom category icons (same as CategoriesScreen)
const customCategoryIcons: { [key: string]: any } = {
  eat: require('../../assets/icons/eat_icon.png'),
  drink: require('../../assets/icons/drink_icon.png'),
  sleep: require('../../assets/icons/sleep_icon.png'),
  open: require('../../assets/icons/open_icon.png'),
  draw: require('../../assets/icons/draw_icon.png'),
  play: require('../../assets/icons/play_icon.png'),
};

// ---------- helpers: normalization & aliasing ----------
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
const canon = (s?: string) => ALIAS[normalize(s)] ?? normalize(s);

const ProgressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [categories, setCategories] = useState<Category[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTeacherView, setIsTeacherView] = useState(false);

  // initial & param-driven load
  useEffect(() => {
    loadProgressData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  // refresh when screen gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProgressData();
    });
    return unsubscribe;
  }, [navigation]);

  // build fast lookups
  const questionById = useMemo(() => {
    const m = new Map<string, Question>();
    allQuestions.forEach(q => m.set(q.id, q));
    return m;
  }, [allQuestions]);

  const videoIdsByCategory = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allVideos.forEach(v => {
      const key = canon(v.categoryId);
      if (!map.has(key)) map.set(key, new Set<string>());
      map.get(key)!.add(v.id);
    });
    return map;
  }, [allVideos]);

  // optional: surface data issues early (attempts referencing unknown questionIds without attempt.categoryId)
  useEffect(() => {
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
  }, [allQuestions, userProgress]);

  // --------- render: user photo ----------
  const renderUserPhoto = (user: User) => {
    if (!user.photo) return <Ionicons name="person" size={40} color="#007AFF" />;

    if (user.photo.startsWith('internal_icon_')) {
      const iconIndex = parseInt(user.photo.replace('internal_icon_', ''), 10);
      const defaultUserIcons = [
        require('../../assets/students/amma_midj_cute_cartoon_3d_blueberry_character_in_style_of_Pixar_4804318d-35c0-4395-8acb-aaf0eb7207c2.png'),
        require('../../assets/students/asgdsbdf_3D_cartoon_image_a_cute_little_girl_black_short_hair_a_f1397976-b441-4ad2-b1e4-6d4ea39f7573.png'),
        require('../../assets/students/bitburstit_special_cartoon_mascot_character_--v_7_58ee647b-3abb-4392-8766-0f58e97958c7.png'),
        require('../../assets/students/coffeeecraze_A_tiny_Notion_character_Cartoon_--ar_169_--raw_--v_b7fdf8ed-82b6-4ace-a6a7-ade966c4bddd.png'),
        require('../../assets/students/doxu64081398_A_cheerful_cartoon_character_designed_like_a_glass_0f41c25f-b262-4bd0-9533-44546d047d17.png'),
        require('../../assets/students/guowenzhu_a_full-body_cartoon_character_inspired_by_a_golden_pe_4c432af8-ccc9-497e-90ee-5490bcd3142a.png'),
        require('../../assets/students/jinhaoooooo_a_full-body_cartoon-style_character_of_a_cute_East__a111b84d-4efa-47a3-a912-04e28e35be06.png'),
        require('../../assets/students/lukehine_3D_Pixar-style_character_highly_detailed_little_boy_wa_9f31df15-bc8e-4ad5-9b22-d0905fa613ae.png'),
        require('../../assets/students/powellkatherine1010_78991_Cute_3D_character_--raw_--v_7_e007ee08-7820-482d-9e34-61295a6a8b73.png'),
        require('../../assets/students/ramsey_shyanne_A_cute_chubby_little_girl_character_full_body_wi_4438f56e-a90a-445f-b7fc-1d12b6b3e409.png'),
        require('../../assets/students/sele77_cartoon_character_kid_in_Pixar_style_black_hair_wearing__ef7af892-d1a4-46c9-9e77-4668fdb2bf54.png'),
        require('../../assets/students/yuepu.able_A_simple_cartoon_girl_drawing_of_an_animated_charact_c88745e2-3d00-49db-8476-658030f06247.png'),
      ];
      return (
        <Image source={defaultUserIcons[iconIndex]} style={styles.userPhoto} resizeMode="contain" />
      );
    }

    return (
      <Image
        source={{ uri: user.photo.startsWith('data:') ? user.photo : `data:image/jpeg;base64,${user.photo}` }}
        style={styles.userPhoto}
      />
    );
  };

  // --------- data load ----------
  const loadProgressData = async () => {
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
  };

  const getCategoryProgress = (categoryId: string): UserProgress | null => {
    return userProgress.find(p => p.categoryId === categoryId) || null;
  };

  // --------- Video progress (unique per category) ----------
  const calculateCategoryVideoPercentage = (categoryId: string): number => {
    const key = canon(categoryId);
    const idsInCategory = videoIdsByCategory.get(key);
    const progress = getCategoryProgress(categoryId);

    if (!idsInCategory || idsInCategory.size === 0 || !progress) return 0;

    const uniqueWatchedInCategory = new Set(
      (progress.videosWatched || []).filter(id => idsInCategory.has(id))
    ).size;

    return (uniqueWatchedInCategory / idsInCategory.size) * 100;
  };

  const getVideoWatchCounts = (categoryId: string) => {
    const key = canon(categoryId);
    const watchCounts: { [videoId: string]: { title: string; count: number } } = {};

    // init all category videos at 0
    allVideos.forEach(v => {
      if (canon(v.categoryId) === key) {
        watchCounts[v.id] = { title: v.title, count: 0 };
      }
    });

    const progress = getCategoryProgress(categoryId);
    if (progress?.videosWatched) {
      progress.videosWatched.forEach(id => {
        if (watchCounts[id]) watchCounts[id].count++;
      });
    }

    return watchCounts;
  };

  // --------- Quiz stats (count every showing) ----------
  const calculateCategoryQuizStats = (categoryId: string) => {
    const key = canon(categoryId);
    const progress = getCategoryProgress(categoryId);

    if (!progress?.quizAttempts?.length) {
      return { correctAnswers: 0, totalQuestions: 0, sufficiency: 0, questionsAnswered: 0 };
    }

    // Prefer attempt.categoryId; fallback to question.categoryId via questionId join
    const attemptsForCategory = progress.quizAttempts.filter(a => {
      const attemptCat = a.categoryId ? canon(a.categoryId) : undefined;
      if (attemptCat) return attemptCat === key;

      const q = questionById.get(a.questionId);
      if (!q) {
        // Unclassifiable attempt: question not found and no attempt.categoryId
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

  // --------- render ----------
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userIcon}>
            {currentUser ? renderUserPhoto(currentUser) : <Ionicons name="person" size={40} color="#007AFF" />}
          </View>
          <Text style={styles.userName}>{currentUser?.name}</Text>
          <Text style={styles.userSubtitle}>Progress Report</Text>
        </View>

        {/* Video Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video Progress</Text>
          <Text style={styles.sectionSubtitle}>Percentage of videos watched in each category</Text>

          {categories.map(category => {
            const videoPercentage = calculateCategoryVideoPercentage(category.id);
            const videoWatchCounts = getVideoWatchCounts(category.id);
            const hasCustomIcon = customCategoryIcons[category.id];

            return (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  {hasCustomIcon ? (
                    <Image
                      source={customCategoryIcons[category.id]}
                      style={styles.categoryIcon}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons
                      name={category.icon as keyof typeof Ionicons.glyphMap}
                      size={80}
                      color="#007AFF"
                    />
                  )}
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryPercentage}>{videoPercentage.toFixed(0)}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${videoPercentage}%` }]} />
                </View>

                <View style={styles.videoCountsContainer}>
                  {Object.entries(videoWatchCounts).map(([videoId, { title, count }], index, array) => (
                    <View key={videoId}>
                      <View style={styles.videoCountItem}>
                        <Text style={styles.videoTitle} numberOfLines={1}>{title}</Text>
                        <Text style={[styles.videoCount, { color: count > 0 ? "#4CAF50" : "#666" }]}>
                          {count > 0 ? `${count} times watched` : "Not watched"}
                        </Text>
                      </View>
                      {index < array.length - 1 && <View style={styles.videoSeparator} />}
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Quiz Performance (teacher view) */}
        {isTeacherView && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quiz Performance</Text>
            <Text style={styles.sectionSubtitle}>Learning sufficiency and statistics for each category</Text>

            {categories.map(category => {
              const quizStats = calculateCategoryQuizStats(category.id);
              const hasCustomIcon = customCategoryIcons[category.id];

              return (
                <View key={category.id} style={styles.quizCategoryItem}>
                  <View style={styles.quizCategoryHeader}>
                    <View style={styles.categoryTitleRow}>
                      {hasCustomIcon ? (
                        <Image
                          source={customCategoryIcons[category.id]}
                          style={styles.quizCategoryIcon}
                          resizeMode="contain"
                        />
                      ) : (
                        <Ionicons
                          name={category.icon as keyof typeof Ionicons.glyphMap}
                          size={72}
                          color="#FF9500"
                        />
                      )}
                      <Text style={styles.quizCategoryName}>{category.name}</Text>
                    </View>
                    <Text style={styles.sufficiencyLabel}>Learning Sufficiency</Text>
                    <View style={styles.sufficiencyRow}>
                      <Text
                        style={[
                          styles.sufficiencyValue,
                          { color: quizStats.sufficiency >= 70 ? '#4CAF50' : quizStats.sufficiency >= 50 ? '#FF9500' : '#f44336' }
                        ]}
                      >
                        {quizStats.sufficiency.toFixed(0)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.quizStatsRow}>
                    <View style={styles.quizStatItem}>
                      <Text style={styles.quizStatValue}>{quizStats.correctAnswers}</Text>
                      <Text style={styles.quizStatLabel}>Correct</Text>
                    </View>
                    <View style={styles.quizStatItem}>
                      <Text style={styles.quizStatValue}>{quizStats.totalQuestions}</Text>
                      <Text style={styles.quizStatLabel}>Total Questions</Text>
                    </View>
                  </View>

                  {quizStats.totalQuestions > 0 && (
                    <View style={styles.quizProgressBar}>
                      <View style={[styles.quizProgressFill, { width: `${quizStats.sufficiency}%` }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  userPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  categoryItem: {
    marginBottom: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoryIcon: {
    width: 80,
    height: 80,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  videoCountsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  videoCountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  videoTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  videoCount: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  videoSeparator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 6,
  },
  quizCategoryItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quizCategoryHeader: {
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  quizCategoryIcon: {
    width: 72,
    height: 72,
  },
  sufficiencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sufficiencyLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  sufficiencyRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  sufficiencyValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  quizStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  quizStatItem: {
    alignItems: 'center',
  },
  quizStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  quizStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  quizProgressBar: {
    height: 6,
    backgroundColor: '#e9ecef',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  quizProgressFill: {
    height: '100%',
    backgroundColor: '#FF9500',
    borderRadius: 3,
  },
});

export default ProgressScreen;
