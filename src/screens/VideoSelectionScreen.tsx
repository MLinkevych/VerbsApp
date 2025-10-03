import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Dimensions,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Video, Category, UserProgress } from '../types';
import dataService from '../utils/dataService';

type VideoSelectionNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoSelection'>;
type VideoSelectionRouteProp = RouteProp<RootStackParamList, 'VideoSelection'>;

interface Props {
  navigation: VideoSelectionNavigationProp;
  route: VideoSelectionRouteProp;
}

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 2; // 2 per row, with side padding/gap

const VideoSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId } = route.params;
  const [videos, setVideos] = useState<Video[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  const loadData = async () => {
    try {
      const [videosData, categoriesData] = await Promise.all([
        dataService.getVideosByCategory(categoryId),
        dataService.getCategories()
      ]);

      setVideos(videosData);
      const currentCategory = categoriesData.find(cat => cat.id === categoryId);
      setCategory(currentCategory || null);

      const currentUser = await dataService.getCurrentUser();
      if (currentUser) {
        const progressData = await dataService.getUserProgress(currentUser.id, categoryId);
        if (progressData.length > 0) setUserProgress(progressData[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load videos');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    navigation.navigate('VideoSequence', { categoryId, startFromVideo: video.id } as any);
  };

  const handleRetakeQuiz = () => navigation.navigate('Quiz', { categoryId });
  const handleBackToCategories = () => navigation.navigate('Categories');

  const isVideoWatched = (videoId: string) =>
    userProgress?.videosWatched.includes(videoId) || false;

  const getVideoThumbnail = (filename: string) => {
    const thumbnailMap: { [key: string]: any } = {
      // Eat category thumbnails
      'Eat/dog_eating.mp4': require('../../assets/Eat/dog_eating.jpg'),
      'Eat/cat_eating.mp4': require('../../assets/Eat/cat_eating.jpg'),
      'Eat/girl_eating.mp4': require('../../assets/Eat/girl_eating.jpg'),
      'Eat/boy_eating.mp4': require('../../assets/Eat/boy_eating.jpg'),
      'Eat/oldman_eating.mp4': require('../../assets/Eat/oldman_eating.jpg'),
      'Eat/woman_eating.mp4': require('../../assets/Eat/woman_eating.jpg'),
      
      // Drink category thumbnails
      'Drink/dog_drinking.mp4': require('../../assets/Drink/dog_drinking.jpg'),
      'Drink/cat_drinking.mp4': require('../../assets/Drink/cat_drinking.jpg'),
      'Drink/girl_drinking.mp4': require('../../assets/Drink/girl_drinking.jpg'),
      'Drink/boy_drinking.mp4': require('../../assets/Drink/boy_drinking.jpg'),
      'Drink/oldman_drinking.mp4': require('../../assets/Drink/oldman_drinking.jpg'),
      'Drink/woman_drinking.mp4': require('../../assets/Drink/woman_drinking.jpg'),
      
      // Sleep category thumbnails
      'Sleep/dog_sleeping.mp4': require('../../assets/Sleep/dog_sleeping.jpg'),
      'Sleep/cat_sleeping.mp4': require('../../assets/Sleep/cat_sleeping.jpg'),
      'Sleep/girl_sleeping.mp4': require('../../assets/Sleep/girl_sleeping.jpg'),
      'Sleep/boy_sleeping.mp4': require('../../assets/Sleep/boy_sleeping.jpg'),
      'Sleep/oldman_sleeping.mp4': require('../../assets/Sleep/oldman_sleeping.jpg'),
      'Sleep/woman_sleeping.mp4': require('../../assets/Sleep/woman_sleeping.jpg'),
      
      // Open category thumbnails
      'Open/dog_opening.mp4': require('../../assets/Open/dog_opening.jpg'),
      'Open/cat_opening.mp4': require('../../assets/Open/cat_opening.jpg'),
      'Open/girl_opening.mp4': require('../../assets/Open/girl_opening.jpg'),
      'Open/boy_opening.mp4': require('../../assets/Open/boy_opening.jpg'),
      'Open/oldman_opening.mp4': require('../../assets/Open/oldman_opening.jpg'),
      'Open/woman_opening.mp4': require('../../assets/Open/woman_opening.jpg'),
      
      // Draw category thumbnails
      'Draw/dog_drawing.mp4': require('../../assets/Draw/dog_drawing.jpg'),
      'Draw/cat_drawing.mp4': require('../../assets/Draw/cat_drawing.jpg'),
      'Draw/girl_drawing.mp4': require('../../assets/Draw/girl_drawing.jpg'),
      'Draw/boy_drawing.mp4': require('../../assets/Draw/boy_drawing.jpg'),
      'Draw/oldman_drawing.mp4': require('../../assets/Draw/oldman_drawing.jpg'),
      'Draw/woman_drawing.mp4': require('../../assets/Draw/woman_drawing.jpg'),
      
      // Play category thumbnails
      'Play/dog_playing.mp4': require('../../assets/Play/dog_playing.jpg'),
      'Play/cat_playing.mp4': require('../../assets/Play/cat_playing.jpg'),
      'Play/girl_playing.mp4': require('../../assets/Play/girl_playing.jpg'),
      'Play/boy_playing.mp4': require('../../assets/Play/boy_playing.jpg'),
      'Play/oldman_playing.mp4': require('../../assets/Play/oldman_playing.jpg'),
      'Play/woman_playing.mp4': require('../../assets/Play/woman_playing.jpg'),
      
      // Blow category thumbnails
      'Blow/dog_blowing.mp4': require('../../assets/Blow/dog_blowing.jpg'),
      'Blow/cat_blowing.mp4': require('../../assets/Blow/cat_blowing.jpg'),
      'Blow/girl_blowing.mp4': require('../../assets/Blow/girl_blowing.jpg'),
      'Blow/boy_blowing.mp4': require('../../assets/Blow/boy_blowing.jpg'),
      'Blow/oldman_blowing.mp4': require('../../assets/Blow/oldman_blowing.jpg'),
      'Blow/woman_blowing.mp4': require('../../assets/Blow/woman_blowing.jpg'),
      
      // Clap category thumbnails
      'Clap/dog_clapping.mp4': require('../../assets/Clap/dog_clapping.jpg'),
      'Clap/cat_clapping.mp4': require('../../assets/Clap/cat_clapping.jpg'),
      'Clap/girl_clapping.mp4': require('../../assets/Clap/girl_clapping.jpg'),
      'Clap/boy_clapping.mp4': require('../../assets/Clap/boy_clapping.jpg'),
      'Clap/oldman_clapping.mp4': require('../../assets/Clap/oldman_clapping.jpg'),
      'Clap/woman_clapping.mp4': require('../../assets/Clap/woman_clapping.jpg'),
      
      // Run category thumbnails
      'Run/dog_running.mp4': require('../../assets/Run/dog_running.jpg'),
      'Run/cat_running.mp4': require('../../assets/Run/cat_running.jpg'),
      'Run/girl_running.mp4': require('../../assets/Run/girl_running.jpg'),
      'Run/boy_running.mp4': require('../../assets/Run/boy_running.jpg'),
      'Run/oldman_running.mp4': require('../../assets/Run/oldman_running.jpg'),
      'Run/woman_running.mp4': require('../../assets/Run/woman_running.jpg'),
      
      // Wash category thumbnails
      'Wash/dog_washing.mp4': require('../../assets/Wash/dog_washing.jpg'),
      'Wash/cat_washing.mp4': require('../../assets/Wash/cat_washing.jpg'),
      'Wash/girl_washing.mp4': require('../../assets/Wash/girl_washing.jpg'),
      'Wash/boy_washing.mp4': require('../../assets/Wash/boy_washing.jpg'),
      'Wash/oldman_washing.mp4': require('../../assets/Wash/oldman_washing.jpg'),
      'Wash/woman_washing.mp4': require('../../assets/Wash/woman_washing.jpg'),
    };
    return thumbnailMap[filename];
  };

  // Render video card
  const renderVideo = ({ item }: { item: Video }) => {
    const thumbnail = getVideoThumbnail(item.filename);
    return (
      <TouchableOpacity style={styles.videoCard} onPress={() => handleVideoSelect(item)} activeOpacity={0.9}>
        <View style={styles.squareImageContainer}>
          {thumbnail ? (
            <Image source={thumbnail} style={styles.squareImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="person" size={40} color="#007AFF" />
            </View>
          )}
          {isVideoWatched(item.id) && (
            <View style={styles.watchedBadge}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const completedVideos = userProgress?.videosWatched.length || 0;
  const totalVideos = videos.length;
  const completionPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Make header scroll with the list
  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.categoryTitle}>{category?.name} Videos</Text>
      <Text style={styles.subtitle}>Choose any video to watch</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completedVideos}/{totalVideos}</Text>
          <Text style={styles.statLabel}>Videos Watched</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{completionPercentage.toFixed(0)}%</Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProgress?.quizAttempts.length || 0}</Text>
          <Text style={styles.statLabel}>Quiz Attempts</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={<View style={{ height: 16 }} />}
        contentContainerStyle={styles.videosList}
        showsVerticalScrollIndicator
      />

      {/* Action Buttons (stay visible, list scrolls behind) */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRetakeQuiz}>
          <Ionicons name="refresh-circle" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Retake Quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleBackToCategories}>
          <Ionicons name="grid" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>All Categories</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },

  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 16 },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center' },

  videosList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100, // room above the fixed buttons
  },
  row: { justifyContent: 'space-between' },

  // Square card: width fixed, height = width
  videoCard: {
    width: CARD_SIZE,
    aspectRatio: 1,      // square
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
     

  // Image fills the square card
  squareImageContainer: { flex: 1 },
  squareImage: { width: '100%', height: '100%' },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },

  watchedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  actionButtons: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    gap: 15,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    gap: 8,
  },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
});

export default VideoSelectionScreen;
