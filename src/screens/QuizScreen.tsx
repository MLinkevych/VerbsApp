import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Image,
  ScrollView,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, CommonActions } from '@react-navigation/native';
import { Video as ExpoVideo, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Video, Category } from '../types';
import dataService from '../utils/dataService';

type QuizNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
type QuizRouteProp = RouteProp<RootStackParamList, 'Quiz'>;

interface Props {
  navigation: QuizNavigationProp;
  route: QuizRouteProp;
}

// Custom category icons (matching CategoriesScreen)
const customCategoryIcons: { [key: string]: any } = {
  eat: require('../../assets/icons/eat_icon.png'),
  drink: require('../../assets/icons/drink_icon.png'),
  sleep: require('../../assets/icons/sleep_icon.png'),
  open: require('../../assets/icons/open_icon.png'),
  draw: require('../../assets/icons/draw_icon.png'),
  play: require('../../assets/icons/play_icon.png'),
};

interface QuizQuestion {
  id: string;
  video: Video;
  correctCategory: Category;
  options: Category[];
}

const { width } = Dimensions.get('window');

// Simple Fireworks Component
const FireworksAnimation: React.FC = () => {
  const animation1 = useRef(new Animated.Value(0)).current;
  const animation2 = useRef(new Animated.Value(0)).current;
  const animation3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(animation1, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animation1, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(animation2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animation2, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(animation3, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animation3, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    };

    animate();
  }, []);

  return (
    <View style={styles.fireworksContainer}>
      <Animated.Text
        style={[
          styles.fireworksEmoji,
          { 
            opacity: animation1,
            transform: [{ scale: animation1 }],
            top: '20%',
            left: '20%',
          }
        ]}
      >
        🎉
      </Animated.Text>
      <Animated.Text
        style={[
          styles.fireworksEmoji,
          { 
            opacity: animation2,
            transform: [{ scale: animation2 }],
            top: '30%',
            right: '20%',
          }
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text
        style={[
          styles.fireworksEmoji,
          { 
            opacity: animation3,
            transform: [{ scale: animation3 }],
            bottom: '20%',
            left: '30%',
          }
        ]}
      >
        🎆
      </Animated.Text>
    </View>
  );
};

const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const { width: sw, height: sh } = useWindowDimensions();
  
  const isLandscape = sw > sh;
  // screen padding that surrounds the video container
  const H_PADDING = 20; // matches your header/list padding vibe

  // space we can use horizontally
  const usableW = sw - H_PADDING * 2;

  // start from width (16:9), but cap the height to leave room for options
  const idealW = Math.min(usableW, 1000);                 // hard cap (optional)
  const idealH = idealW * 9 / 16;

// cap video height more aggressively in landscape
  const maxH = isLandscape ? sh * 0.38 : sh * 0.32;       // tweak if needed
  const videoH = Math.min(idealH, maxH);
  const videoW = videoH * 16 / 9;
  
  const videoRef = useRef<ExpoVideo>(null);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    loadQuizData();
    setupAudio();
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const getCategoryIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      restaurant: 'restaurant',
      bed: 'bed',
      'game-controller': 'game-controller',
      book: 'book',
      fitness: 'fitness',
      chatbubbles: 'chatbubbles',
      'help-circle': 'help-circle',
      help: 'help',
      open: 'folder-open',
      water: 'water',
      brush: 'brush',
    };
    return iconMap[iconName] || 'help';
  };

  const loadQuizData = async () => {
    try {
      // Get all categories and videos
      const [categoriesData, allVideos] = await Promise.all([
        dataService.getCategories(),
        dataService.getAllVideos()
      ]);

      // Filter out categories that don't have videos and the quiz item
      const availableCategories = categoriesData.filter(cat => 
        cat.id !== '__quiz__' && allVideos.some(video => video.categoryId === cat.id)
      );

      if (availableCategories.length < 3) {
        Alert.alert('Error', 'Need at least 3 categories to play quiz');
        navigation.goBack();
        return;
      }

      // Generate 5 questions
      const generatedQuestions: QuizQuestion[] = [];
      for (let i = 0; i < 5; i++) {
        // Select random category and video
        const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
        const categoryVideos = allVideos.filter(video => video.categoryId === randomCategory.id);
        const randomVideo = categoryVideos[Math.floor(Math.random() * categoryVideos.length)];

        // Get 2 other random categories for wrong answers
        const wrongCategories = availableCategories
          .filter(cat => cat.id !== randomCategory.id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);

        // Create 3 options and shuffle them
        const options = [randomCategory, ...wrongCategories].sort(() => 0.5 - Math.random());

        generatedQuestions.push({
          id: `question_${i + 1}`,
          video: randomVideo,
          correctCategory: randomCategory,
          options
        });
      }

      setQuestions(generatedQuestions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (categoryId: string) => {
    if (showResult) return;
    setSelectedAnswer(categoryId);

    const correct = categoryId === currentQuestion.correctCategory.id;
    setIsCorrect(correct);
    setShowResult(true);

    // Save quiz attempt to user progress
    try {
      const currentUser = await dataService.getCurrentUser();
      if (currentUser && currentQuestion) {
        const quizAttempt = {
          id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          questionId: `q_${currentQuestion.correctCategory.id}_${currentQuestionIndex + 1}`, // Generate consistent question ID
          selectedAnswer: categoryId,
          isCorrect: correct,
          attemptedAt: new Date(),
          timeTaken: 5, // Approximate time - could be enhanced with actual timing
          categoryId: currentQuestion.correctCategory.id // Add category for reliable stats calculation
        };
        
        await dataService.addQuizAttempt(currentUser.id, currentQuestion.correctCategory.id, quizAttempt);
      }
    } catch (error) {
      console.error('Failed to save quiz attempt:', error);
    }

    // Play audio feedback
    await playAudioFeedback(correct);

    if (correct) {
      setScore(score + 1);
      setShowFireworks(true);
      // Hide fireworks after animation
      setTimeout(() => setShowFireworks(false), 2000);
    }

    // Keep video playing

    // Auto-advance to next question or finish quiz
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= questions.length) {
        // Quiz completed - reset navigation to Categories with proper back button
        navigation.dispatch(
          CommonActions.reset({
            index: 2,
            routes: [
              { name: 'Login' },
              { name: 'StudentSelect' },
              { name: 'Categories' }
            ],
          })
        );
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setShowFireworks(false);
      }
    }, correct ? 2500 : 1500); // Longer delay for correct answers to show fireworks
  };

  // Video assets mapping (updated to match new naming convention)
  const videoAssets: { [key: string]: any } = {
    // Eat category videos
    'Eat/dog_eating.mp4': require('../../assets/Eat/dog_eating.mp4'),
    'Eat/cat_eating.mp4': require('../../assets/Eat/cat_eating.mp4'),
    'Eat/girl_eating.mp4': require('../../assets/Eat/girl_eating.mp4'),
    'Eat/boy_eating.mp4': require('../../assets/Eat/boy_eating.mp4'),
    'Eat/woman_eating.mp4': require('../../assets/Eat/woman_eating.mp4'),
    
    // Drink category videos
    'Drink/dog_drinking.mp4': require('../../assets/Drink/dog_drinking.mp4'),
    'Drink/cat_drinking.mp4': require('../../assets/Drink/cat_drinking.mp4'),
    'Drink/girl_drinking.mp4': require('../../assets/Drink/girl_drinking.mp4'),
    'Drink/boy_drinking.mp4': require('../../assets/Drink/boy_drinking.mp4'),
    'Drink/woman_drinking.mp4': require('../../assets/Drink/woman_drinking.mp4'),
    
    // Sleep category videos
    'Sleep/dog_sleeping.mp4': require('../../assets/Sleep/dog_sleeping.mp4'),
    'Sleep/cat_sleeping.mp4': require('../../assets/Sleep/cat_sleeping.mp4'),
    'Sleep/girl_sleeping.mp4': require('../../assets/Sleep/girl_sleeping.mp4'),
    'Sleep/boy_sleeping.mp4': require('../../assets/Sleep/boy_sleeping.mp4'),
    'Sleep/woman_sleeping.mp4': require('../../assets/Sleep/woman_sleeping.mp4'),
    
    // Open category videos
    'Open/dog_opening.mp4': require('../../assets/Open/dog_opening.mp4'),
    'Open/cat_opening.mp4': require('../../assets/Open/cat_opening.mp4'),
    'Open/girl_opening.mp4': require('../../assets/Open/girl_opening.mp4'),
    'Open/boy_opening.mp4': require('../../assets/Open/boy_opening.mp4'),
    'Open/woman_opening.mp4': require('../../assets/Open/woman_opening.mp4'),
    
    // Draw category videos
    'Draw/dog_drawing.mp4': require('../../assets/Draw/dog_drawing.mp4'),
    'Draw/cat_drawing.mp4': require('../../assets/Draw/cat_drawing.mp4'),
    'Draw/girl_drawing.mp4': require('../../assets/Draw/girl_drawing.mp4'),
    'Draw/boy_drawing.mp4': require('../../assets/Draw/boy_drawing.mp4'),
    'Draw/woman_drawing.mp4': require('../../assets/Draw/woman_drawing.mp4'),
    
    // Play category videos
    'Play/dog_playing.mp4': require('../../assets/Play/dog_playing.mp4'),
    'Play/cat_playing.mp4': require('../../assets/Play/cat_playing.mp4'),
    'Play/girl_playing.mp4': require('../../assets/Play/girl_playing.mp4'),
    'Play/boy_playing.mp4': require('../../assets/Play/boy_playing.mp4'),
    'Play/woman_playing.mp4': require('../../assets/Play/woman_playing.mp4'),
  };

  // Audio assets for quiz feedback
  const audioAssets = {
    wow: require('../../assets/Media/quiz/wow.mp3'),
    great: require('../../assets/Media/quiz/great.mp3'),
    great_job: require('../../assets/Media/quiz/great_job.mp3'),
    you_got_it_right: require('../../assets/Media/quiz/you_got_it_right.mp3'),
    cool: require('../../assets/Media/quiz/cool.mp3'),
    that_is_a_wrong_answer: require('../../assets/Media/quiz/that_is_a_wrong_answer.mp3'),
    another_try: require('../../assets/Media/quiz/another_try.mp3'),
    try_quiz_one_more_time: require('../../assets/Media/quiz/try_quiz_one_more_time.mp3'),
  };

  // Track consecutive wrong answers for this quiz session
  const [consecutiveWrongAnswers, setConsecutiveWrongAnswers] = useState(0);

  // Function to play audio feedback
  const playAudioFeedback = async (isCorrect: boolean) => {
    try {
      if (isCorrect) {
        // Reset consecutive wrong answers on correct answer
        setConsecutiveWrongAnswers(0);
        
        // Randomly select from correct answer sounds: wow, great, great_job, you_got_it_right, cool
        const correctSounds = [
          audioAssets.wow, 
          audioAssets.great, 
          audioAssets.great_job, 
          audioAssets.you_got_it_right,
          audioAssets.cool
        ];
        const randomSound = correctSounds[Math.floor(Math.random() * correctSounds.length)];
        const { sound } = await Audio.Sound.createAsync(randomSound);
        await sound.playAsync();
        
        // Clean up sound object after playing
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      } else {
        // Increment consecutive wrong answers
        const newConsecutiveWrong = consecutiveWrongAnswers + 1;
        setConsecutiveWrongAnswers(newConsecutiveWrong);
        
        let soundToPlay;
        if (newConsecutiveWrong >= 2) {
          // If this is the second wrong answer in a row, play "try_quiz_one_more_time"
          soundToPlay = audioAssets.try_quiz_one_more_time;
        } else {
          // For first wrong answer, randomly select: that_is_a_wrong_answer, another_try
          const wrongSounds = [audioAssets.that_is_a_wrong_answer, audioAssets.another_try];
          soundToPlay = wrongSounds[Math.floor(Math.random() * wrongSounds.length)];
        }
        
        const { sound } = await Audio.Sound.createAsync(soundToPlay);
        await sound.playAsync();
        
        // Clean up sound object after playing
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio feedback:', error);
    }
  };

  // Load video when question changes
  useEffect(() => {
    if (currentQuestion && videoRef.current) {
      loadVideoAsync();
    }
  }, [currentQuestion]);

  const loadVideoAsync = async () => {
    if (!currentQuestion || !videoRef.current) return;

    try {
      const videoAsset = videoAssets[currentQuestion.video.filename];
      if (!videoAsset) {
        console.error('Video asset not found:', currentQuestion.video.filename);
        return;
      }

      await videoRef.current.loadAsync(videoAsset, { 
        shouldPlay: true, // Auto-play instantly
        isLooping: true 
      });
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading video:', error);
    }
  };


  if (loading || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Time! 🎯</Text>
          <Text style={styles.subtitle}>Which category does this video show?</Text>
          <Text style={styles.questionCounter}>Question {currentQuestionIndex + 1} of 5</Text>
        </View>

      {/* Video Player */}
      <View style={[styles.videoContainer, { width: videoW, height: videoH, alignSelf: 'center' }]}>
  <ExpoVideo
    ref={videoRef}
    style={styles.video}
    useNativeControls={false}
    shouldPlay={true}
    isLooping={true}
    onPlaybackStatusUpdate={(status) => {
      if (status.isLoaded && status.didJustFinish) {
        // looping anyway
      }
    }}
  />
      </View>

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          Watch the video and choose the correct category:
        </Text>
      </View>

      {/* Category Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((category) => {
          const hasCustomIcon = customCategoryIcons[category.id];
          const isSelected = selectedAnswer === category.id;
          const isCorrectAnswer = showResult && category.id === currentQuestion.correctCategory.id;
          const isWrongSelected = showResult && isSelected && !isCorrectAnswer;

          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.optionButton,
                isSelected && styles.selectedOption,
                isCorrectAnswer && styles.correctOption,
                isWrongSelected && styles.incorrectOption,
              ]}
              onPress={() => handleAnswerSelect(category.id)}
              disabled={showResult}
            >
              <View style={[
                styles.iconContainer,
                isSelected && styles.selectedIconContainer,
                isCorrectAnswer && styles.correctIconContainer,
                isWrongSelected && styles.incorrectIconContainer,
              ]}>
                {hasCustomIcon ? (
                  <Image 
                    source={customCategoryIcons[category.id]} 
                    style={styles.customIcon} 
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons 
                    name={getCategoryIconName(category.icon)} 
                    size={24} 
                    color={
                      isCorrectAnswer ? '#4CAF50' :
                      isWrongSelected ? '#f44336' :
                      isSelected ? '#007AFF' : '#666'
                    } 
                  />
                )}
              </View>
              <Text style={[
                styles.optionText,
                isSelected && styles.selectedOptionText,
                isCorrectAnswer && styles.correctOptionText,
                isWrongSelected && styles.incorrectOptionText,
              ]}>
                {category.name}
              </Text>
              
              {/* Result indicators */}
              {showResult && isCorrectAnswer && (
                <View style={styles.resultIndicator}>
                </View>
              )}
              {showResult && isWrongSelected && (
                <View style={styles.resultIndicator}>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Result Feedback */}
      {showResult && !isCorrect && (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultText, styles.incorrectText]}>
            ❌ Incorrect
          </Text>
          <Text style={styles.explanationText}>
            This video shows "{currentQuestion.correctCategory.name}".
          </Text>
        </View>
      )}

      {/* Fireworks Animation */}
      {showFireworks && <FireworksAnimation />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginBottom: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    marginBottom: 15,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  questionCounter: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 5,
  },
  videoContainer: {
    backgroundColor: '#000',
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  video: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    marginHorizontal: 5,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
  },
  incorrectOption: {
    borderColor: '#f44336',
    backgroundColor: '#ffebee',
  },
  iconContainer: {
   width: 44,
   height: 44,
   borderRadius: 22,
   backgroundColor: '#f8f9fa',
   justifyContent: 'center',
   alignItems: 'center',
   marginRight: 12,
  },
  selectedIconContainer: {
    backgroundColor: '#e0f0ff',
  },
  correctIconContainer: {
    backgroundColor: '#e0f0e0',
  },
  incorrectIconContainer: {
    backgroundColor: '#ffe0e0',
  },
  customIcon: {
    width: 40,
    height: 40,
  },
  optionText: {
    flexShrink: 1,       
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'left',
  },
  selectedOptionText: {
    color: '#007AFF',
  },
  correctOptionText: {
    color: '#4CAF50',
  },
  incorrectOptionText: {
    color: '#f44336',
  },
  resultIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  resultContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  correctText: {
    color: '#4CAF50',
  },
  incorrectText: {
    color: '#f44336',
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  actionContainer: {
    padding: 20,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultButtonsContainer: {
    gap: 10,
  },
  playAgainButton: {
    backgroundColor: '#FF6B6B',
  },
  backToCategoriesButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  backToCategoriesText: {
    color: '#007AFF',
  },
  fireworksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  fireworksEmoji: {
    position: 'absolute',
    fontSize: 40,
    zIndex: 1001,
  },
});

export default QuizScreen;