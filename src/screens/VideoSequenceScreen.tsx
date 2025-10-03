import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Video as ExpoVideo, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Video, Category, UserProgress } from '../types';
import dataService from '../utils/dataService';

import type { ViewStyle } from 'react-native';

type VideoSequenceNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VideoSequence'>;
type VideoSequenceRouteProp = RouteProp<RootStackParamList, 'VideoSequence'>;
type PlayBadgeProps = { size?: number; color?: string; bg?: string; style?: ViewStyle };
type BadgeProps = { size?: number };

interface Props {
  navigation: VideoSequenceNavigationProp;
  route: VideoSequenceRouteProp;
}

const { width, height } = Dimensions.get('window');

// Character mapping no longer needed - new video naming convention uses audio character names directly

// Audio file mappings
const audioAssets: { [key: string]: any } = {
  // Level 1 audios
  'eat_1level': require('../../assets/Eat/1level/eating_1level.mp3'),
  'drink_1level': require('../../assets/Drink/1level/drinking_1level.mp3'),
  'sleep_1level': require('../../assets/Sleep/1level/sleeping_1level.mp3'),
  'open_1level': require('../../assets/Open/1level/opening_1level.mp3'),
  'draw_1level': require('../../assets/Draw/1level/drawing_1level.mp3'),
  'play_1level': require('../../assets/Play/1level/playing_1level.mp3'),
  'blow_1level': require('../../assets/Blow/1level/blowing_1level.mp3'),
  'clap_1level': require('../../assets/Clap/1level/clapping_1level.mp3'),
  'run_1level': require('../../assets/Run/1level/running_1level.mp3'),
  'wash_1level': require('../../assets/Wash/1level/washing_1level.mp3'),
  
  // Level 2 audios - all character combinations
  // Boy audios
  'boy_eat_2level': require('../../assets/Eat/2level/boy_eating_2level.mp3'),
  'boy_drink_2level': require('../../assets/Drink/2level/boy_drinking_2level.mp3'),
  'boy_sleep_2level': require('../../assets/Sleep/2level/boy_sleeping_2level.mp3'),
  'boy_open_2level': require('../../assets/Open/2level/boy_opening_2level.mp3'),
  'boy_draw_2level': require('../../assets/Draw/2level/boy_drawing_2level.mp3'),
  'boy_play_2level': require('../../assets/Play/2level/boy_playing_2level.mp3'),
  
  // Girl audios
  'girl_eat_2level': require('../../assets/Eat/2level/girl_eating_2level.mp3'),
  'girl_drink_2level': require('../../assets/Drink/2level/girl_drinking_2level.mp3'),
  'girl_sleep_2level': require('../../assets/Sleep/2level/girl_sleeping_2level.mp3'),
  'girl_open_2level': require('../../assets/Open/2level/girl_opening_2level.mp3'),
  'girl_draw_2level': require('../../assets/Draw/2level/girl_drawing_2level.mp3'),
  'girl_play_2level': require('../../assets/Play/2level/girl_playing_2level.mp3'),
  
  // Dog audios
  'dog_eat_2level': require('../../assets/Eat/2level/dog_eating_2level.mp3'),
  'dog_drink_2level': require('../../assets/Drink/2level/dog_drinking_2level.mp3'),
  'dog_sleep_2level': require('../../assets/Sleep/2level/dog_sleeping_2level.mp3'),
  'dog_open_2level': require('../../assets/Open/2level/dog_opening_2level.mp3'),
  'dog_draw_2level': require('../../assets/Draw/2level/dog_drawing_2level.mp3'),
  'dog_play_2level': require('../../assets/Play/2level/dog_playing_2level.mp3'),
  
  // Cat audios
  'cat_eat_2level': require('../../assets/Eat/2level/cat_eating_2level.mp3'),
  'cat_drink_2level': require('../../assets/Drink/2level/cat_drinking_2level.mp3'),
  'cat_sleep_2level': require('../../assets/Sleep/2level/cat_sleeping_2level.mp3'),
  'cat_open_2level': require('../../assets/Open/2level/cat_opening_2level.mp3'),
  'cat_draw_2level': require('../../assets/Draw/2level/cat_drawing_2level.mp3'),
  'cat_play_2level': require('../../assets/Play/2level/cat_playing_2level.mp3'),
  
  // Woman audios for level 2
  'woman_eat_2level': require('../../assets/Eat/2level/woman_eating_2level.mp3'),
  'woman_drink_2level': require('../../assets/Drink/2level/woman_drinking_2level.mp3'),
  'woman_sleep_2level': require('../../assets/Sleep/2level/woman_sleeping_2level.mp3'),
  'woman_open_2level': require('../../assets/Open/2level/woman_opening_2level.mp3'),
  'woman_draw_2level': require('../../assets/Draw/2level/woman_drawing_2level.mp3'),
  'woman_play_2level': require('../../assets/Play/2level/woman_playing_2level.mp3'),
  
  // Oldman audios for level 2
  'oldman_eat_2level': require('../../assets/Eat/2level/oldman_eating_2level.mp3'),
  'oldman_drink_2level': require('../../assets/Drink/2level/oldman_drinking_2level.mp3'),
  'oldman_sleep_2level': require('../../assets/Sleep/2level/oldman_sleeping_2level.mp3'),
  'oldman_open_2level': require('../../assets/Open/2level/oldman_opening_2level.mp3'),
  'oldman_draw_2level': require('../../assets/Draw/2level/oldman_drawing_2level.mp3'),
  'oldman_play_2level': require('../../assets/Play/2level/oldman_playing_2level.mp3'),
  
  // Level 3 audios - all character combinations
  // Boy audios
  'boy_eat_3level': require('../../assets/Eat/3level/boy_eating_3level.mp3'),
  'boy_drink_3level': require('../../assets/Drink/3level/boy_drinking_3level.mp3'),
  'boy_sleep_3level': require('../../assets/Sleep/3level/boy_sleeping_3level.mp3'),
  'boy_open_3level': require('../../assets/Open/3level/boy_opening_3level.mp3'),
  'boy_draw_3level': require('../../assets/Draw/3level/boy_drawing_3level.mp3'),
  'boy_play_3level': require('../../assets/Play/3level/boy_playing_3level.mp3'),
  
  // Girl audios
  'girl_eat_3level': require('../../assets/Eat/3level/girl_eating_3level.mp3'),
  'girl_drink_3level': require('../../assets/Drink/3level/girl_drinking_3level.mp3'),
  'girl_sleep_3level': require('../../assets/Sleep/3level/girl_sleeping_3level.mp3'),
  'girl_open_3level': require('../../assets/Open/3level/girl_opening_3level.mp3'),
  'girl_draw_3level': require('../../assets/Draw/3level/girl_drawing_3level.mp3'),
  'girl_play_3level': require('../../assets/Play/3level/girl_playing_3level.mp3'),
  
  // Dog audios
  'dog_eat_3level': require('../../assets/Eat/3level/dog_eating_3level.mp3'),
  'dog_drink_3level': require('../../assets/Drink/3level/dog_drinking_3level.mp3'),
  'dog_sleep_3level': require('../../assets/Sleep/3level/dog_sleeping_3level.mp3'),
  'dog_open_3level': require('../../assets/Open/3level/dog_opening_3level.mp3'),
  'dog_draw_3level': require('../../assets/Draw/3level/dog_drawing_3level.mp3'),
  'dog_play_3level': require('../../assets/Play/3level/dog_playing_3level.mp3'),
  
  // Cat audios
  'cat_eat_3level': require('../../assets/Eat/3level/cat_eating_3level.mp3'),
  'cat_drink_3level': require('../../assets/Drink/3level/cat_drinking_3level.mp3'),
  'cat_sleep_3level': require('../../assets/Sleep/3level/cat_sleeping_3level.mp3'),
  'cat_open_3level': require('../../assets/Open/3level/cat_opening_3level.mp3'),
  'cat_draw_3level': require('../../assets/Draw/3level/cat_drawing_3level.mp3'),
  'cat_play_3level': require('../../assets/Play/3level/cat_playing_3level.mp3'),
  
  // Woman audios
  'woman_eat_3level': require('../../assets/Eat/3level/woman_eating_3level.mp3'),
  'woman_drink_3level': require('../../assets/Drink/3level/woman_drinking_3level.mp3'),
  'woman_sleep_3level': require('../../assets/Sleep/3level/woman_sleeping_3level.mp3'),
  'woman_open_3level': require('../../assets/Open/3level/woman_opening_3level.mp3'),
  'woman_draw_3level': require('../../assets/Draw/3level/woman_drawing_3level.mp3'),
  'woman_play_3level': require('../../assets/Play/3level/woman_playing_3level.mp3'),
  
  // Oldman audios for level 3
  'oldman_eat_3level': require('../../assets/Eat/3level/oldman_eating_3level.mp3'),
  'oldman_drink_3level': require('../../assets/Drink/3level/oldman_drinking_3level.mp3'),
  'oldman_sleep_3level': require('../../assets/Sleep/3level/oldman_sleeping_3level.mp3'),
  'oldman_open_3level': require('../../assets/Open/3level/oldman_opening_3level.mp3'),
  'oldman_draw_3level': require('../../assets/Draw/3level/oldman_drawing_3level.mp3'),
  'oldman_play_3level': require('../../assets/Play/3level/oldman_playing_3level.mp3'),
  
  // New categories - Level 2 audios
  // Blow category level 2
  'boy_blow_2level': require('../../assets/Blow/2level/boy_blowing_2level.mp3'),
  'girl_blow_2level': require('../../assets/Blow/2level/girl_blowing_2level.mp3'),
  'dog_blow_2level': require('../../assets/Blow/2level/dog_blowing_2level.mp3'),
  'cat_blow_2level': require('../../assets/Blow/2level/cat_blowing_2level.mp3'),
  'oldman_blow_2level': require('../../assets/Blow/2level/oldman_blowing_2level.mp3'),
  'woman_blow_2level': require('../../assets/Blow/2level/woman_blowing_2level.mp3'),
  
  // Clap category level 2
  'boy_clap_2level': require('../../assets/Clap/2level/boy_clapping_2level.mp3'),
  'girl_clap_2level': require('../../assets/Clap/2level/girl_clapping_2level.mp3'),
  'dog_clap_2level': require('../../assets/Clap/2level/dog_clapping_2level.mp3'),
  'cat_clap_2level': require('../../assets/Clap/2level/cat_clapping_2level.mp3'),
  'oldman_clap_2level': require('../../assets/Clap/2level/oldman_clapping_2level.mp3'),
  'woman_clap_2level': require('../../assets/Clap/2level/woman_clapping_2level.mp3'),
  
  // Run category level 2
  'boy_run_2level': require('../../assets/Run/2level/boy_running_2level.mp3'),
  'girl_run_2level': require('../../assets/Run/2level/girl_running_2level.mp3'),
  'dog_run_2level': require('../../assets/Run/2level/dog_running_2level.mp3'),
  'cat_run_2level': require('../../assets/Run/2level/cat_running_2level.mp3'),
  'oldman_run_2level': require('../../assets/Run/2level/oldman_running_2level.mp3'),
  'woman_run_2level': require('../../assets/Run/2level/woman_running_2level.mp3'),
  
  // Wash category level 2
  'boy_wash_2level': require('../../assets/Wash/2level/boy_washing_2level.mp3'),
  'girl_wash_2level': require('../../assets/Wash/2level/girl_washing_2level.mp3'),
  'dog_wash_2level': require('../../assets/Wash/2level/dog_washing_2level.mp3'),
  'cat_wash_2level': require('../../assets/Wash/2level/cat_washing_2level.mp3'),
  'oldman_wash_2level': require('../../assets/Wash/2level/oldman_washing_2level.mp3'),
  'woman_wash_2level': require('../../assets/Wash/2level/woman_washing_2level.mp3'),
  
  // New categories - Level 3 audios
  // Blow category level 3
  'boy_blow_3level': require('../../assets/Blow/3level/boy_blowing_3level.mp3'),
  'girl_blow_3level': require('../../assets/Blow/3level/girl_blowing_3level.mp3'),
  'dog_blow_3level': require('../../assets/Blow/3level/dog_blowing_3level.mp3'),
  'cat_blow_3level': require('../../assets/Blow/3level/cat_blowing_3level.mp3'),
  'oldman_blow_3level': require('../../assets/Blow/3level/oldman_blowing_3level.mp3'),
  'woman_blow_3level': require('../../assets/Blow/3level/woman_blowing_3level.mp3'),
  
  // Clap category level 3
  'boy_clap_3level': require('../../assets/Clap/3level/boy_clapping_3level.mp3'),
  'girl_clap_3level': require('../../assets/Clap/3level/girl_clapping_3level.mp3'),
  'dog_clap_3level': require('../../assets/Clap/3level/dog_clapping_3level.mp3'),
  'cat_clap_3level': require('../../assets/Clap/3level/cat_clapping_3level.mp3'),
  'oldman_clap_3level': require('../../assets/Clap/3level/oldman_clapping_3level.mp3'),
  'woman_clap_3level': require('../../assets/Clap/3level/woman_clapping_3level.mp3'),
  
  // Run category level 3
  'boy_run_3level': require('../../assets/Run/3level/boy_running_3level.mp3'),
  'girl_run_3level': require('../../assets/Run/3level/girl_running_3level.mp3'),
  'dog_run_3level': require('../../assets/Run/3level/dog_running_3level.mp3'),
  'cat_run_3level': require('../../assets/Run/3level/cat_running_3level.mp3'),
  'oldman_run_3level': require('../../assets/Run/3level/oldman_running_3level.mp3'),
  'woman_run_3level': require('../../assets/Run/3level/woman_running_3level.mp3'),
  
  // Wash category level 3
  'boy_wash_3level': require('../../assets/Wash/3level/boy_washing_3level.mp3'),
  'girl_wash_3level': require('../../assets/Wash/3level/girl_washing_3level.mp3'),
  'dog_wash_3level': require('../../assets/Wash/3level/dog_washing_3level.mp3'),
  'cat_wash_3level': require('../../assets/Wash/3level/cat_washing_3level.mp3'),
  'oldman_wash_3level': require('../../assets/Wash/3level/oldman_washing_3level.mp3'),
  'woman_wash_3level': require('../../assets/Wash/3level/woman_washing_3level.mp3'),
};

const VideoSequenceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { categoryId } = route.params;
  const [videos, setVideos] = useState<Video[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [isPausing, setIsPausing] = useState(false);
  const [allVideosWatched, setAllVideosWatched] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [videoFinished, setVideoFinished] = useState(false);
  const [audioPaused, setAudioPaused] = useState(false);
  
  const videoRef = useRef<ExpoVideo>(null);
  const audioRef = useRef<Audio.Sound | null>(null);
  
  // Audio playback functions
  const getAudioKey = (categoryId: string, level: number, currentVideo?: Video) => {
    if (level === 1) {
      return `${categoryId}_1level`;
    }
    
    // For levels 2 and 3, we need to determine the character from the video filename
    if (!currentVideo) return null;
    
    // Extract character name from filename (e.g., "Sleep/cat_sleeping.mp4" -> "cat")
    const fileName = currentVideo.filename;
    const characterName = fileName.split('/')[1]?.split('_')[0];
    
    // Character name is already the audio file character in new naming convention
    if (!characterName) {
      console.warn(`No character name found in filename: ${fileName}`);
      return null;
    }
    
    const audioKey = `${characterName}_${categoryId}_${level}level`;
    console.log(`Generated audio key: ${audioKey} for video: ${fileName}`);
    return audioKey;
  };
  
  const playAudioForVideo = async () => {
    if (!isSoundEnabled || !category) return;
    
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }
      
      // Get the audio file for current category and level
      const currentVideo = videos[currentVideoIndex];
      const audioKey = getAudioKey(category.id, selectedLevel, currentVideo);
      const audioAsset = audioKey ? audioAssets[audioKey] : null;
      
      if (audioAsset) {
        try {
          // Create new audio instance
          const { sound } = await Audio.Sound.createAsync(audioAsset);
          audioRef.current = sound;
          
          // Play audio after 1 second delay
          setTimeout(async () => {
            if (audioRef.current && isSoundEnabled) {
              await audioRef.current.playAsync();
            }
          }, 1000);
        } catch (audioError) {
          console.error('Error loading audio asset:', audioKey, audioError);
          // Continue without audio rather than crashing
        }
      } else {
        console.warn('No audio asset found for key:', audioKey);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };
  
  const stopAudio = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.stopAsync();
        await audioRef.current.unloadAsync();
        audioRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const pauseAudio = async () => {
    try {
      if (audioRef.current) {
        await audioRef.current.pauseAsync();
        setAudioPaused(true);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  };

  const resumeAudio = async () => {
    try {
      if (audioRef.current && audioPaused) {
        await audioRef.current.playAsync();
        setAudioPaused(false);
      }
    } catch (error) {
      console.error('Error resuming audio:', error);
    }
  };

  const PlayBadge = ({ size = 20, color = '#fff', bg = 'rgba(0,0,0,0.25)', style }: PlayBadgeProps) => {
    const circle = { width: size * 1.8, height: size * 1.8, borderRadius: size * 0.9, backgroundColor: bg };
    const triTop = size * 0.6;
    const triLeft = size * 0.9;
  
    return (
      <View style={[styles.playBadge, circle, style]}>
        <View
          style={[
            styles.playTriangle,
            { borderTopWidth: triTop, borderBottomWidth: triTop, borderLeftWidth: triLeft, borderLeftColor: color },
          ]}
        />
      </View>
    );
  };

  const CircleBadge = (
    { size = 20, bg = 'rgba(0,0,0,0.25)', children }: { size?: number; bg?: string; children?: React.ReactNode }
  ) => {
    const s = {
      width: size * 1.8,
      height: size * 1.8,
      borderRadius: size * 0.9,
      backgroundColor: bg,
      justifyContent: 'center',
      alignItems: 'center',
    } as const;
    return <View style={s}>{children}</View>;
  };

  const PauseBadge: React.FC<BadgeProps> = ({ size = 18 }) => (
    <CircleBadge size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[styles.iconBar, { width: size * 0.35, height: size * 1.1 }]} />
        <View style={[styles.iconBar, { width: size * 0.35, height: size * 1.1, marginLeft: size * 0.3 }]} />
      </View>
    </CircleBadge>
  );
  
  const NextBadge: React.FC<BadgeProps> = ({ size = 18 }) => (
    <CircleBadge size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[
          styles.playTriangle,
          { borderTopWidth: size * 0.55, borderBottomWidth: size * 0.55, borderLeftWidth: size * 0.8 }
        ]}/>
        <View style={[styles.iconBar, { width: size * 0.28, height: size * 1.05, marginLeft: size * 0.12 }]} />
      </View>
    </CircleBadge>
  );
  
  const StopBadge: React.FC<BadgeProps> = ({ size = 18 }) => (
    <CircleBadge size={size}>
      <View style={[styles.iconSquare, { width: size, height: size }]} />
    </CircleBadge>
  );
  
  const ReturnBadge: React.FC<BadgeProps> = ({ size = 16 }) => (
    <CircleBadge size={size}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 0, height: 0,
          borderTopWidth: size * 0.5, borderBottomWidth: size * 0.5, borderLeftWidth: size * 0.7,
          borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#fff'
        }}/>
        <View style={[styles.iconBar, { width: size * 0.6, height: size * 0.22, marginLeft: -size * 0.10 }]} />
      </View>
    </CircleBadge>
  );

  const [isSequenceMode, setIsSequenceMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [categoryId]);

  useEffect(() => {
    if (videos.length > 0 && currentVideoIndex < videos.length && hasStarted && showVideoPlayer) {
      playCurrentVideo();
    }
  }, [currentVideoIndex, videos, hasStarted, showVideoPlayer]);
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);
  
  // Stop audio when sound is disabled
  useEffect(() => {
    if (!isSoundEnabled) {
      stopAudio();
    }
  }, [isSoundEnabled]);

  const loadData = async () => {
    try {
      await dataService.ensureSeedUpToDate();
      const [videosData, categoriesData] = await Promise.all([
        dataService.getVideosByCategory(categoryId),
        dataService.getCategories()
      ]);
      
      setVideos(videosData);
      const currentCategory = categoriesData.find(cat => cat.id === categoryId);
      setCategory(currentCategory || null);

      // Load user progress
      const currentUser = await dataService.getCurrentUser();
      if (currentUser) {
        const progressData = await dataService.getUserProgress(currentUser.id, categoryId);
        if (progressData.length > 0) {
          const progress = progressData[0];
          setUserProgress(progress);
          setWatchedVideos(progress.videosWatched);
          
          // Check if starting from specific video
          const startFromVideoId = (route.params as any)?.startFromVideo;
          let startIndex = 0;
          if (startFromVideoId) {
            const videoIndex = videosData.findIndex(v => v.id === startFromVideoId);
            startIndex = videoIndex >= 0 ? videoIndex : 0;
            setHasStarted(true); // Auto-start when coming from video selection
            setShowVideoPlayer(true);
          }
          
          setCurrentVideoIndex(startIndex);
          
          // Update progress with new starting position
          const updatedProgress: UserProgress = {
            ...progress,
            currentVideoIndex: startIndex,
            hasCompletedSequence: false,
          };
          setUserProgress(updatedProgress);
          await dataService.updateUserProgress(updatedProgress);
        } else {
          // Create new progress record
          const newProgress: UserProgress = {
            userId: currentUser.id,
            categoryId,
            videosWatched: [],
            currentVideoIndex: 0,
            hasCompletedSequence: false,
            quizAttempts: [],
          };
          setUserProgress(newProgress);
          await dataService.updateUserProgress(newProgress);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load videos');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const playCurrentVideo = async () => {
    if (videoRef.current && videos[currentVideoIndex]) {
      try {
        // First stop any current playback
        setIsPlaying(false);

        try { await videoRef.current.unloadAsync(); } catch {}
        const currentVideo = videos[currentVideoIndex];
        
        const videoAssets: { [key: string]: any } = {
          // Eat category videos
          'Eat/dog_eating.mp4': require('../../assets/Eat/dog_eating.mp4'),
          'Eat/cat_eating.mp4': require('../../assets/Eat/cat_eating.mp4'),
          'Eat/girl_eating.mp4': require('../../assets/Eat/girl_eating.mp4'),
          'Eat/boy_eating.mp4': require('../../assets/Eat/boy_eating.mp4'),
          'Eat/oldman_eating.mp4': require('../../assets/Eat/oldman_eating.mp4'),
          'Eat/woman_eating.mp4': require('../../assets/Eat/woman_eating.mp4'),
          
          // Drink category videos
          'Drink/dog_drinking.mp4': require('../../assets/Drink/dog_drinking.mp4'),
          'Drink/cat_drinking.mp4': require('../../assets/Drink/cat_drinking.mp4'),
          'Drink/girl_drinking.mp4': require('../../assets/Drink/girl_drinking.mp4'),
          'Drink/boy_drinking.mp4': require('../../assets/Drink/boy_drinking.mp4'),
          'Drink/oldman_drinking.mp4': require('../../assets/Drink/oldman_drinking.mp4'),
          'Drink/woman_drinking.mp4': require('../../assets/Drink/woman_drinking.mp4'),
          
          // Sleep category videos
          'Sleep/dog_sleeping.mp4': require('../../assets/Sleep/dog_sleeping.mp4'),
          'Sleep/cat_sleeping.mp4': require('../../assets/Sleep/cat_sleeping.mp4'),
          'Sleep/girl_sleeping.mp4': require('../../assets/Sleep/girl_sleeping.mp4'),
          'Sleep/boy_sleeping.mp4': require('../../assets/Sleep/boy_sleeping.mp4'),
          'Sleep/oldman_sleeping.mp4': require('../../assets/Sleep/oldman_sleeping.mp4'),
          'Sleep/woman_sleeping.mp4': require('../../assets/Sleep/woman_sleeping.mp4'),
          
          // Open category videos
          'Open/dog_opening.mp4': require('../../assets/Open/dog_opening.mp4'),
          'Open/cat_opening.mp4': require('../../assets/Open/cat_opening.mp4'),
          'Open/girl_opening.mp4': require('../../assets/Open/girl_opening.mp4'),
          'Open/boy_opening.mp4': require('../../assets/Open/boy_opening.mp4'),
          'Open/oldman_opening.mp4': require('../../assets/Open/oldman_opening.mp4'),
          'Open/woman_opening.mp4': require('../../assets/Open/woman_opening.mp4'),
          
          // Draw category videos
          'Draw/dog_drawing.mp4': require('../../assets/Draw/dog_drawing.mp4'),
          'Draw/cat_drawing.mp4': require('../../assets/Draw/cat_drawing.mp4'),
          'Draw/girl_drawing.mp4': require('../../assets/Draw/girl_drawing.mp4'),
          'Draw/boy_drawing.mp4': require('../../assets/Draw/boy_drawing.mp4'),
          'Draw/oldman_drawing.mp4': require('../../assets/Draw/oldman_drawing.mp4'),
          'Draw/woman_drawing.mp4': require('../../assets/Draw/woman_drawing.mp4'),
          
          // Play category videos
          'Play/dog_playing.mp4': require('../../assets/Play/dog_playing.mp4'),
          'Play/cat_playing.mp4': require('../../assets/Play/cat_playing.mp4'),
          'Play/girl_playing.mp4': require('../../assets/Play/girl_playing.mp4'),
          'Play/boy_playing.mp4': require('../../assets/Play/boy_playing.mp4'),
          'Play/oldman_playing.mp4': require('../../assets/Play/oldman_playing.mp4'),
          'Play/woman_playing.mp4': require('../../assets/Play/woman_playing.mp4'),
          
          // Blow category videos
          'Blow/dog_blowing.mp4': require('../../assets/Blow/dog_blowing.mp4'),
          'Blow/cat_blowing.mp4': require('../../assets/Blow/cat_blowing.mp4'),
          'Blow/girl_blowing.mp4': require('../../assets/Blow/girl_blowing.mp4'),
          'Blow/boy_blowing.mp4': require('../../assets/Blow/boy_blowing.mp4'),
          'Blow/oldman_blowing.mp4': require('../../assets/Blow/oldman_blowing.mp4'),
          'Blow/woman_blowing.mp4': require('../../assets/Blow/woman_blowing.mp4'),
          
          // Clap category videos
          'Clap/dog_clapping.mp4': require('../../assets/Clap/dog_clapping.mp4'),
          'Clap/cat_clapping.mp4': require('../../assets/Clap/cat_clapping.mp4'),
          'Clap/girl_clapping.mp4': require('../../assets/Clap/girl_clapping.mp4'),
          'Clap/boy_clapping.mp4': require('../../assets/Clap/boy_clapping.mp4'),
          'Clap/oldman_clapping.mp4': require('../../assets/Clap/oldman_clapping.mp4'),
          'Clap/woman_clapping.mp4': require('../../assets/Clap/woman_clapping.mp4'),
          
          // Run category videos
          'Run/dog_running.mp4': require('../../assets/Run/dog_running.mp4'),
          'Run/cat_running.mp4': require('../../assets/Run/cat_running.mp4'),
          'Run/girl_running.mp4': require('../../assets/Run/girl_running.mp4'),
          'Run/boy_running.mp4': require('../../assets/Run/boy_running.mp4'),
          'Run/oldman_running.mp4': require('../../assets/Run/oldman_running.mp4'),
          'Run/woman_running.mp4': require('../../assets/Run/woman_running.mp4'),
          
          // Wash category videos
          'Wash/dog_washing.mp4': require('../../assets/Wash/dog_washing.mp4'),
          'Wash/cat_washing.mp4': require('../../assets/Wash/cat_washing.mp4'),
          'Wash/girl_washing.mp4': require('../../assets/Wash/girl_washing.mp4'),
          'Wash/boy_washing.mp4': require('../../assets/Wash/boy_washing.mp4'),
          'Wash/oldman_washing.mp4': require('../../assets/Wash/oldman_washing.mp4'),
          'Wash/woman_washing.mp4': require('../../assets/Wash/woman_washing.mp4'),
        };
        
        // Check if the video asset exists
        if (!videoAssets[currentVideo.filename]) {
          throw new Error(`Video asset not found: ${currentVideo.filename}`);
        }
        
        // Load video without auto-play first
        await videoRef.current.loadAsync(
          videoAssets[currentVideo.filename],
          { 
            shouldPlay: false,
            positionMillis: 0,
            rate: 1.0,
            isLooping: false
          }
        );

        // Wait a moment for the video to fully load, then start playing
        setTimeout(async () => {
          if (videoRef.current) {
            await videoRef.current.setPositionAsync(0);
            await videoRef.current.playAsync();
            setIsPlaying(true);
            setVideoFinished(false); // Reset finished state for new video
            setAudioPaused(false); // Reset audio pause state for new video
            // Start audio playback
            playAudioForVideo();
          }
        }, 500);
        
      } catch (error) {
        console.error('Video playback error:', error);
        setIsPlaying(false);
        Alert.alert('Error', `Failed to play video: ${videos[currentVideoIndex]?.title || 'Unknown video'}`);
      }
    }
  };

  const handleVideoComplete = async () => {
    const currentVideo = videos[currentVideoIndex];
    
    // Mark video as finished
    setVideoFinished(true);
    setAudioPaused(false); // Reset audio pause state when video completes
  
    // mark watched
    const newWatchedVideos = watchedVideos.includes(currentVideo.id)
      ? watchedVideos
      : [...watchedVideos, currentVideo.id];
    setWatchedVideos(newWatchedVideos);
  
    // progress: only advance in sequence mode
    const nextIndex = isSequenceMode ? currentVideoIndex + 1 : currentVideoIndex;
  
    if (userProgress) {
      const updatedProgress: UserProgress = {
        ...userProgress,
        videosWatched: newWatchedVideos,
        currentVideoIndex: nextIndex,
        hasCompletedSequence: isSequenceMode && (nextIndex >= videos.length),
      };
      setUserProgress(updatedProgress);
      await dataService.updateUserProgress(updatedProgress);
    }
  
    if (isSequenceMode) {
      // sequence behavior (Play All)
      if (nextIndex >= videos.length) {
        setAllVideosWatched(true);
        setTimeout(() => {
          setShowVideoPlayer(false);
          setIsSequenceMode(false);
          setAllVideosWatched(false);
        }, 2000);
      } else {
        setIsPausing(true);
        setTimeout(() => {
          setIsPausing(false);
          setCurrentVideoIndex(nextIndex);
        }, 5000);
      }
    } else {
      // SINGLE video behavior: don't auto-close, wait for Exit button
      try {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
      } catch {}
      setIsPlaying(false);
      setIsPausing(false);
      setAllVideosWatched(false);
      // Don't close the video player automatically for single videos
    }
  };
  

  // const handleVideoComplete = async () => {
  //   const currentVideo = videos[currentVideoIndex];
  //   const newWatchedVideos = [...watchedVideos];
  
  //   if (!newWatchedVideos.includes(currentVideo.id)) {
  //     newWatchedVideos.push(currentVideo.id);
  //     setWatchedVideos(newWatchedVideos);
  //   }
  
  //   if (userProgress) {
  //     const updatedProgress: UserProgress = {
  //       ...userProgress,
  //       videosWatched: newWatchedVideos,
  //       currentVideoIndex: currentVideoIndex + 1,
  //       hasCompletedSequence: isSequenceMode && (currentVideoIndex + 1 >= videos.length),
  //     };
  //     setUserProgress(updatedProgress);
  //     await dataService.updateUserProgress(updatedProgress);
  //   }
  
  //   // Behavior differs by mode
  //   if (isSequenceMode) {
  //     if (currentVideoIndex + 1 >= videos.length) {
  //       // End of Play All run
  //       setAllVideosWatched(true);
  //       setTimeout(() => {
  //         setShowVideoPlayer(false);
  //         setIsSequenceMode(false);
  //         setAllVideosWatched(false); // ensure clean reopen
  //       }, 2000);
  //     } else {
  //       // brief pause then next video
  //       setIsPausing(true);
  //       setTimeout(() => {
  //         setIsPausing(false);
  //         setCurrentVideoIndex(currentVideoIndex + 1);
  //       }, 1000);
  //     }
  //   } else {
  //     // Single-video mode: simply stop (no overlay, no auto-advance)
  //     setIsPlaying(false);
  //   }
  // };
  

  // const handleVideoComplete = async () => {
  //   const currentVideo = videos[currentVideoIndex];
  //   const newWatchedVideos = [...watchedVideos];
    
  //   if (!newWatchedVideos.includes(currentVideo.id)) {
  //     newWatchedVideos.push(currentVideo.id);
  //     setWatchedVideos(newWatchedVideos);
  //   }

  //   if (userProgress) {
  //     const updatedProgress: UserProgress = {
  //       ...userProgress,
  //       videosWatched: newWatchedVideos,
  //       currentVideoIndex: currentVideoIndex + 1,
  //       hasCompletedSequence: currentVideoIndex + 1 >= videos.length,
  //     };
      
  //     setUserProgress(updatedProgress);
  //     await dataService.updateUserProgress(updatedProgress);

  //     if (currentVideoIndex + 1 >= videos.length) {
  //       // All videos watched - enable quiz button and close modal
  //       setAllVideosWatched(true);
  //       setTimeout(() => {
  //         setShowVideoPlayer(false);
  //       }, 1000); // Close modal after 1 second
  //     } else {
  //       // Pause for 1 second before next video
  //       setIsPausing(true);
  //       setTimeout(() => {
  //         setIsPausing(false);
  //         setCurrentVideoIndex(currentVideoIndex + 1);
  //       }, 1000);
  //     }
  //   }
  // };

  const handleSkip = () => {
    console.log('Next button pressed');
    if (currentVideoIndex < videos.length - 1) {
      // Manual skip - advance to next video regardless of mode
      const nextIndex = currentVideoIndex + 1;
      const currentVideo = videos[currentVideoIndex];
      
      // Mark current video as watched
      const newWatchedVideos = watchedVideos.includes(currentVideo.id)
        ? watchedVideos
        : [...watchedVideos, currentVideo.id];
      setWatchedVideos(newWatchedVideos);
      
      // Update progress
      if (userProgress) {
        const updatedProgress: UserProgress = {
          ...userProgress,
          videosWatched: newWatchedVideos,
          currentVideoIndex: nextIndex,
          hasCompletedSequence: isSequenceMode && (nextIndex >= videos.length),
        };
        setUserProgress(updatedProgress);
        dataService.updateUserProgress(updatedProgress);
      }
      
      // Move to next video
      setCurrentVideoIndex(nextIndex);
    }
  };

  const handlePrevious = () => {
    console.log('Back button pressed');
    if (currentVideoIndex > 0) {
      // Go to previous video
      const prevIndex = currentVideoIndex - 1;
      setCurrentVideoIndex(prevIndex);
    }
  };

  const handleStop = async () => {
    console.log('Exit button pressed');
    if (videoRef.current) {
      try { await videoRef.current.pauseAsync(); await videoRef.current.unloadAsync(); } catch {}
    }
    await stopAudio();
    setIsPlaying(false);
    setIsPausing(false);
    setAllVideosWatched(false);
    setIsSequenceMode(false);
    setShowVideoPlayer(false);
  };
  // const handleStop = async () => {
  //   if (videoRef.current) {
  //     try { 
  //       await videoRef.current.pauseAsync();
  //       await videoRef.current.unloadAsync(); 
  //     } catch {}
  //   }
  //   setIsPlaying(false);
  //   setIsPausing(false);
  //   setShowVideoPlayer(false); // closes modal, returns to grid
  // };

  const handleExitToGrid = async () => {
    console.log('Back button pressed');
    if (videoRef.current) {
      try { await videoRef.current.pauseAsync(); await videoRef.current.unloadAsync(); } catch {}
    }
    await stopAudio();
    setShowVideoPlayer(false);
    setIsPlaying(false);
    setIsPausing(false);
    setAllVideosWatched(false);
    setIsSequenceMode(false);
  };
  // const handleExitToGrid = async () => {
  //   if (videoRef.current) {
  //     try {
  //       await videoRef.current.pauseAsync();
  //       await videoRef.current.unloadAsync();
  //     } catch {}
  //   }
  //   setShowVideoPlayer(false);
  //   setIsPlaying(false);
  //   setIsPausing(false);
  // };

  // Function to get learning cards based on level and video
  const getLearningCards = (filename: string, level: number) => {
    const cards: any[] = [];
    
    if (level === 1) {
      // Level 1: Show action card only
      const category = filename.split('/')[0].toLowerCase();
      const actionCardMap: { [key: string]: any } = {
        'eat': require('../../assets/Learn_cards/eating-1.png'),
        'drink': require('../../assets/Learn_cards/drinking-1.png'),
        'sleep': require('../../assets/Learn_cards/sleeping-2.png'), // Using sleeping-2 as it's available
        'open': require('../../assets/Learn_cards/opening-1.png'),
        'draw': require('../../assets/Learn_cards/drawing-1.png'),
        'play': require('../../assets/Learn_cards/learn_playing.png'),
        'blow': require('../../assets/Learn_cards/eating-1.png'), // Fallback, no blow-1 available
        'clap': require('../../assets/Learn_cards/eating-1.png'), // Fallback, no clap-1 available
        'run': require('../../assets/Learn_cards/eating-1.png'), // Fallback, no run-1 available
        'wash': require('../../assets/Learn_cards/eating-1.png'), // Fallback, no wash-1 available
      };
      
      const actionCard = actionCardMap[category];
      if (actionCard) {
        cards.push(actionCard);
      }
    } else if (level === 2) {
      // Level 2: Show character card above action card
      const character = filename.split('/')[1]?.split('_')[0];
      const category = filename.split('/')[0].toLowerCase();
      
      // Character cards
      const characterCardMap: { [key: string]: any } = {
        'boy': require('../../assets/Learn_cards/boy-2.png'),
        'girl': require('../../assets/Learn_cards/girl-2.png'),
        'dog': require('../../assets/Learn_cards/dog-2.png'),
        'cat': require('../../assets/Learn_cards/cat-2.png'),
        'woman': require('../../assets/Learn_cards/woman-2.png'),
        'oldman': require('../../assets/Learn_cards/oldman-2.png'),
        'man': require('../../assets/Learn_cards/man-2.png'),
        'oldwoman': require('../../assets/Learn_cards/oldwoman-2.png'),
      };
      
      // Action cards
      const actionCardMap: { [key: string]: any } = {
        'eat': require('../../assets/Learn_cards/eating-1.png'),
        'drink': require('../../assets/Learn_cards/drinking-1.png'),
        'sleep': require('../../assets/Learn_cards/sleeping-2.png'),
        'open': require('../../assets/Learn_cards/opening-1.png'),
        'draw': require('../../assets/Learn_cards/drawing-1.png'),
        'play': require('../../assets/Learn_cards/learn_playing.png'),
        'blow': require('../../assets/Learn_cards/eating-1.png'), // Fallback
        'clap': require('../../assets/Learn_cards/eating-1.png'), // Fallback
        'run': require('../../assets/Learn_cards/eating-1.png'), // Fallback
        'wash': require('../../assets/Learn_cards/eating-1.png'), // Fallback
      };
      
      // Add character card first (will be on top)
      if (character && characterCardMap[character]) {
        cards.push(characterCardMap[character]);
      }
      
      // Add action card second (will be below)
      if (actionCardMap[category]) {
        cards.push(actionCardMap[category]);
      }
    }
    
    return cards;
  };

  // Function to get video thumbnail images
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

  const handleStartOrReplay = () => {
    if (!hasStarted) {
      // First time starting
      setHasStarted(true);
      setCurrentVideoIndex(0);
      setAllVideosWatched(false);
      setIsPausing(false);
    } else {
      // Replaying - reset to first video
      setCurrentVideoIndex(0);
      setAllVideosWatched(false);
      setIsPausing(false);
      setHasStarted(true); // Keep started state
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading videos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (videos.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No videos found for this category</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorBackButton}>
            <Text style={styles.errorBackButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentVideo = videos[currentVideoIndex];
  const progress = ((currentVideoIndex + 1) / videos.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        
        {/* Level Description */}
        <View style={styles.levelDescriptionContainer}>
          <Text style={styles.levelDescriptionText}>
            1 Level - Verb + Learning cards{'\n'}
            2 Level - Verb+Noun + Learning cards{'\n'}
            3 Level - Verb+Noun+Subjective
          </Text>
        </View>
        
        {/* Audio Controls */}
        <View style={styles.audioControlsContainer}>
        <TouchableOpacity
  style={[styles.audioControlButton, isSoundEnabled && styles.audioControlButtonActive]}
  onPress={() => setIsSoundEnabled(!isSoundEnabled)}
>
  <Ionicons 
    name={isSoundEnabled ? "volume-high-outline" : "volume-mute-outline"}   // Ionicons names
    size={24}                                               // make it bigger
    color="#fff"
  />
  <Text style={[styles.audioControlText, isSoundEnabled && styles.audioControlTextActive]}>
    {isSoundEnabled ? 'On' : 'Off'}
  </Text>
</TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.audioControlButton, selectedLevel === 1 && styles.audioControlButtonActive]}
            onPress={() => setSelectedLevel(1)}
          >
            <Text style={[styles.levelNumber, selectedLevel === 1 && styles.levelNumberActive]}>1</Text>
            <Text style={[styles.audioControlText, selectedLevel === 1 && styles.audioControlTextActive]}>Level</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.audioControlButton, selectedLevel === 2 && styles.audioControlButtonActive]}
            onPress={() => setSelectedLevel(2)}
          >
            <Text style={[styles.levelNumber, selectedLevel === 2 && styles.levelNumberActive]}>2</Text>
            <Text style={[styles.audioControlText, selectedLevel === 2 && styles.audioControlTextActive]}>Level</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.audioControlButton, selectedLevel === 3 && styles.audioControlButtonActive]}
            onPress={() => setSelectedLevel(3)}
          >
            <Text style={[styles.levelNumber, selectedLevel === 3 && styles.levelNumberActive]}>3</Text>
            <Text style={[styles.audioControlText, selectedLevel === 3 && styles.audioControlTextActive]}>Level</Text>
          </TouchableOpacity>
        </View>
                
        {/* Videos Header */}
        <Text style={styles.videosHeaderTitle}>Videos in this category:</Text>
      </View>

      {/* Video Selection Grid */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.videoGrid}>
          {videos.map((video, index) => (
            <TouchableOpacity 
              key={video.id} 
              style={[
                styles.videoGridItem,
                index === currentVideoIndex && styles.currentVideoItem,
                watchedVideos.includes(video.id) && styles.watchedVideoItem,
              ]}
              onPress={() => {
                setIsSequenceMode(false);   // ← important
                setAllVideosWatched(false);
                setIsPausing(false);
                setHasStarted(true);
                setCurrentVideoIndex(index);
                setShowVideoPlayer(true);
              }}
            >
              <View style={styles.videoThumbnailContainer}>
                {getVideoThumbnail(video.filename) ? (
                  <Image 
                    source={getVideoThumbnail(video.filename)} 
                    style={styles.videoThumbnailImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderThumbnail}>
                    <Ionicons name="person" size={40} color="#007AFF" />
                  </View>
                )}


                {isPausing && index === currentVideoIndex && (
                  <View style={styles.countdownOverlay}>
                    <Text style={styles.pauseCountdown}>Next in 3s...</Text>
                  </View>
                )}
              </View>

            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    
{/* Play All Videos Button - Moved to bottom */}
<View style={styles.bottomControls}>
<TouchableOpacity
  onPress={() => {
    setIsSequenceMode(true);
    setAllVideosWatched(false);
    setIsPausing(false);
    handleStartOrReplay();
    setShowVideoPlayer(true);
  }}
  style={styles.mainControlButton}
>
  <Ionicons name="play-outline" size={28} color="#fff" style={{ marginRight: 8 }} />
  <Text style={styles.mainControlText}>Play all videos</Text>
</TouchableOpacity>

</View>

      {/* Video Player Modal */}
      <Modal
        visible={showVideoPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={handleExitToGrid}
      >
        <SafeAreaView style={styles.modalContainer}>

          <View style={styles.modalVideoContainer}>
            {/* Learning Cards Container */}
            <View style={[
              styles.learningCardsContainer,
              selectedLevel === 1 && styles.learningCardsContainerLevel1
            ]}>
              {getLearningCards(currentVideo?.filename || '', selectedLevel).map((card, index) => (
                <Image
                  key={index}
                  source={card}
                  style={styles.learningCard}
                  resizeMode="contain"
                />
              ))}
            </View>
            
            <ExpoVideo
              ref={videoRef}
              style={styles.modalVideo}
              useNativeControls={false}
              shouldPlay={false}
              isLooping={false}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded && status.didJustFinish && !isPausing && isPlaying) {
                  console.log('Video finished naturally, duration:', status.durationMillis, 'position:', status.positionMillis);
                  setIsPlaying(false);
                  handleVideoComplete();
                }
              }}
            />

            {/* Video Overlay with Play Button */}
        
            {isPausing && (
              <View style={styles.pauseOverlay}>
                <Text style={styles.pauseText}>Next video in 5 seconds...</Text>
              </View>
            )}
            
            {isSequenceMode && allVideosWatched && (
  <View style={styles.completionOverlay}>
    <Text style={styles.completionText}>All videos completed!</Text>
                <Text style={styles.completionSubText}>Player will close in 1 second...</Text>
              </View>
            )}
          </View>

          {/* Modal Controls */}
          <View style={styles.modalControls}>
            {/* Back button */}
            <TouchableOpacity
              onPress={handlePrevious}
              style={[
                styles.modalControlButton,
                currentVideoIndex <= 0 && styles.modalControlButtonDisabled
              ]}
              disabled={currentVideoIndex <= 0}
              hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
              <Text style={[
                styles.modalControlText,
                currentVideoIndex <= 0 && styles.modalControlTextDisabled
              ]}>Back</Text>
              <Ionicons name="play-back-outline" size={32} color="#fff" style={{ marginTop: 4 }} />
            </TouchableOpacity>

            {/* Next button */}
            <TouchableOpacity 
              onPress={handleSkip} 
              style={[
                styles.modalControlButton,
                currentVideoIndex >= videos.length - 1 && styles.modalControlButtonDisabled
              ]}
              disabled={currentVideoIndex >= videos.length - 1}
            >
              <Text style={[
                styles.modalControlText,
                currentVideoIndex >= videos.length - 1 && styles.modalControlTextDisabled
              ]}>Next</Text>
              <Ionicons name="play-forward-outline" size={32} color="#fff" style={{ marginTop: 4 }} />
            </TouchableOpacity>

            {/* Pause/Play button */}
            <TouchableOpacity
              onPress={async () => {
                console.log('Play/Pause button pressed');
                if (videoRef.current) {
                  try {
                    if (isPlaying) { 
                      await videoRef.current.pauseAsync(); 
                      await pauseAudio();
                      setIsPlaying(false); 
                    } else { 
                      if (videoFinished) {
                        // If video is finished, restart from beginning
                        await videoRef.current.setPositionAsync(0);
                        setVideoFinished(false);
                        setAudioPaused(false);
                        // Start fresh audio for restarted video
                        playAudioForVideo();
                      } else if (audioPaused) {
                        // If audio was paused, resume it
                        await resumeAudio();
                      } else {
                        // First time playing or no audio loaded yet
                        playAudioForVideo();
                      }
                      // Continue playing from current position (or beginning if finished)
                      await videoRef.current.playAsync(); 
                      setIsPlaying(true); 
                    }
                  } catch (e) {}
                }
              }}
              style={styles.modalControlButton}
            >
            <Text style={styles.modalControlText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            <Ionicons 
            name={isPlaying ? "pause-outline" : "play-outline"} 
            size={36} 
            color="#fff" 
            style={{ marginTop: 4 }} 
            />
            </TouchableOpacity>

            {/* Exit button */}
            <TouchableOpacity onPress={handleStop} style={styles.modalControlButton}>
            <Text style={styles.modalControlText}>Exit</Text>
            <Ionicons name="stop-outline" size={32} color="#fff" style={{ marginTop: 4 }} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorBackButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
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
  videosHeaderTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  bottomControls: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  mainControlButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  mainControlText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // quizButton: {
  //   backgroundColor: '#4CAF50',
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   paddingVertical: 16,
  //   borderRadius: 12,
  //   gap: 8,
  //   marginTop: 10,
  // },
  // quizButtonText: {
  //   color: '#fff',
  //   fontSize: 18,
  //   fontWeight: '600',
  // },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  modalVideoContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  learningCardsContainer: {
    position: 'absolute',
    left: 40,
    top: '40%',
    transform: [{ translateY: -100 }],
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
    gap: 40,
  },
  learningCardsContainerLevel1: {
    top: '50%',
    transform: [{ translateY: -80 }], // Center Level 1 cards vertically
  },
  learningCard: {
    width: 160,  // ← Increased from 80 to 120
    height: 160, // ← Increased from 80 to 120
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalVideo: {
    width: width * 0.7,
    height: width * 0.6,
    zIndex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  playOverlayButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 50,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseOverlay: {
    position: 'absolute',
    bottom: 20, left: 20, right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 8,
    zIndex: 5,
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  completionOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  completionText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  completionSubText: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalControls: {
    position: 'absolute',
    right: 50,
    top: '40%',
    marginTop: -140,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    gap: 10,
    zIndex: 1000,
  },
  modalControlButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 100,
    height: 100,
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalControlText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalControlButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  modalControlTextDisabled: {
    color: '#ccc',
  },
  controlIconDisabled: {
    opacity: 0.5,
  },
  modalBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 12,
  },
  modalBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
  },
  // Video grid styles
  videoGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  videoGridItem: {
    width: '45%',
    borderRadius: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 0,            // ← remove padding
    aspectRatio: 1,        // ← force perfect square
    overflow: 'hidden',    // ← keep rounded corners on the image
    alignItems: 'stretch', // ← let child fill
  },
  currentVideoItem: {
    borderWidth: 3,
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  watchedVideoItem: {
    backgroundColor: '#f0fff0',
  },
  videoThumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
  },
  videoThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  countdownOverlay: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 5,
    borderRadius: 4,
  },
  videoGridText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  videoOrderText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  pauseCountdown: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  currentVideoText: {
    color: '#007AFF',
  },
  watchedVideoText: {
    color: '#4CAF50',
  },
  icon24: {
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
    // tintColor: '#fff', // uncomment if your PNGs are monochrome and you want them white
  },
  icon20: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    // tintColor: '#fff', // or a green tint for "check" if you prefer
  },
  playBadge: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#fff',
    // slight offset so the triangle looks centered visually
    marginLeft: 2,
  },
  iconBar: { backgroundColor: '#fff', borderRadius: 2 },
  iconSquare: { backgroundColor: '#fff', borderRadius: 3 },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
    marginRight: 8,
  },
  controlIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
    marginBottom: 4,
  },
  
  // Level Description Styles
  levelDescriptionContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  levelDescriptionText: {
    fontSize: 14,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  
  // Audio Controls Styles
  audioControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  audioControlButton: {
    backgroundColor: '#6c757d',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 65,
    gap: 4,
  },
  audioControlButtonActive: {
    backgroundColor: '#007AFF',
  },
  audioControlButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  audioControlText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  audioControlTextActive: {
    color: '#fff',
  },
  audioControlTextDisabled: {
    color: '#999',
  },
  levelNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelNumberActive: {
    color: '#fff',
  },
});

export default VideoSequenceScreen;
