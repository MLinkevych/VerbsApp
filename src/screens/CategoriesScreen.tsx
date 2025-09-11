import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Category, User } from '../types';
import dataService from '../utils/dataService';

type CategoriesNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

interface Props {
  navigation: CategoriesNavigationProp;
}

// Custom category icons
const customCategoryIcons: { [key: string]: any } = {
  eat: require('../../assets/icons/eat_icon.png'),
  drink: require('../../assets/icons/drink_icon.png'),
  sleep: require('../../assets/icons/sleep_icon.png'),
  open: require('../../assets/icons/open_icon.png'),
  draw: require('../../assets/icons/draw_icon.png'),
  play: require('../../assets/icons/play_icon.png'),
  __quiz__: require('../../assets/icons/quiz_icon.png'),
};

const QUIZ_SENTINEL_ID = '__quiz__';
const QUIZ_ITEM = {
  id: QUIZ_SENTINEL_ID,
  name: 'Quiz Time!',
  description: 'Test your knowledge with fun videos',
  icon: 'help-circle',
  unlocked: true,
  videoCount: 0,
  order: 999,
} as unknown as Category;

const CategoriesScreen: React.FC<Props> = ({ navigation }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ----- layout math (3 columns, squares) -----
  const { width } = useWindowDimensions();
  const H_PADDING = 20;     // must match styles.categoriesList horizontal padding
  const COL_GAP = 16;       // visual gap between cards
  const NUM_COLS = 3;
  const CARD_SIZE = Math.floor(
    (width - H_PADDING * 2 - COL_GAP * (NUM_COLS - 1)) / NUM_COLS
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const user = await dataService.getCurrentUser();
      setCurrentUser(user);
      
      // TEMPORARY: Force add Play category
      await (dataService as any).forceAddPlayCategory();
      
      await dataService.ensureSeedUpToDate();
      const categoriesData = await dataService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    if (category.id === QUIZ_SENTINEL_ID) {
      // TODO: route to your Quiz screen / home
      navigation.navigate('Quiz', { categoryId: 'random' });
      return;
    }

    if (!category.unlocked) {
      Alert.alert('Category Locked', 'Complete the previous category to unlock this one!', [{ text: 'OK' }]);
      return;
    }
    navigation.navigate('VideoSequence', { categoryId: category.id });
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

  const renderCategory = ({ item }: { item: Category }) => {
    const isQuiz = item.id === QUIZ_SENTINEL_ID;
    const hasCustomIcon = customCategoryIcons[item.id];

    // scale inner bits so text/icons don’t overflow
const padding = Math.max(10, Math.round(CARD_SIZE * 0.06));
const circle  = Math.round(CARD_SIZE * 0.42);          // icon circle (unchanged)
const iconSize = Math.round(circle * 0.62);            // icon (unchanged)

// ↓ smaller text multipliers
const nameFS  = Math.max(13, Math.round(CARD_SIZE * 0.11));
const countFS = Math.max(11, Math.round(CARD_SIZE * 0.09));
const descFS  = Math.max(10, Math.round(CARD_SIZE * 0.08));

    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          !item.unlocked && !isQuiz && styles.lockedCard,
          isQuiz && styles.quizCard,
          { width: CARD_SIZE, aspectRatio: 1, padding, marginBottom: 16 },
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <View
          style={[
            styles.iconContainer,
            !item.unlocked && !isQuiz && styles.lockedIcon,
            isQuiz && styles.quizIconContainer,
            { width: circle, height: circle, borderRadius: circle / 2, marginBottom: Math.round(CARD_SIZE * 0.06) },
          ]}
        >
          {hasCustomIcon ? (
            <Image
              source={customCategoryIcons[item.id]}
              style={{ width: iconSize, height: iconSize, opacity: item.unlocked || isQuiz ? 1 : 0.4 }}
              resizeMode="contain"
            />
          ) : (
            <Ionicons
              name={getCategoryIconName(item.icon)}
              size={iconSize}
              color={isQuiz ? '#16A34A' : item.unlocked ? '#007AFF' : '#ccc'}
            />
          )}

          {!item.unlocked && !isQuiz && (
            <View style={[styles.lockOverlay, { borderRadius: circle / 2 }]}>
              <Ionicons name="lock-closed" size={Math.round(iconSize * 0.46)} color="#999" />
            </View>
          )}
        </View>

        <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[
              styles.categoryName,
              !item.unlocked && !isQuiz && styles.lockedText,
              isQuiz && styles.quizText,
              { fontSize: nameFS },
            ]}
          >
            {isQuiz ? 'Quiz' : item.name}
          </Text>
          
          {!isQuiz && (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.videoCount, !item.unlocked && styles.lockedText, { fontSize: countFS }]}
            >
              {item.videoCount} videos
            </Text>
          )}
          
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[
              styles.description,
              !item.unlocked && !isQuiz && styles.lockedText,
              isQuiz && styles.quizDescription,
              { fontSize: descFS, lineHeight: Math.round(descFS * 1.22) },
            ]}
          >
            {isQuiz ? 'Test what you’ve learned' : item.description}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Hi {currentUser?.name}! 👋</Text>
        <Text style={styles.subtitle}>Choose a category to start learning</Text>
      </View>

      <FlatList
        data={[...categories, QUIZ_ITEM]}              // Quiz always last
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        key={`cols-${NUM_COLS}-${CARD_SIZE}`}          // force re-layout on rotate/resize
        contentContainerStyle={[styles.categoriesList, { paddingHorizontal: H_PADDING }]}
        columnWrapperStyle={{ justifyContent: 'space-between' }} // reliable across RN versions
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },

  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },

  welcomeText: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },

  categoriesList: { paddingVertical: 20, paddingBottom: 40 },

  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  lockedCard: { backgroundColor: '#f5f5f5', opacity: 0.7 },

  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f0f8ff',
  },
  lockedIcon: { backgroundColor: '#f0f0f0' },
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },

  categoryName: { color: '#333', fontWeight: '600', textAlign: 'center' },
  videoCount: { color: '#007AFF', fontWeight: '500', textAlign: 'center' },
  description: { color: '#666', textAlign: 'center' },
  lockedText: { color: '#999' },

  quizCard: { backgroundColor: '#F0FDF4', borderWidth: 2, borderColor: '#22C55E' },
  quizIconContainer: { backgroundColor: '#DCFCE7' },
  quizText: { color: '#16A34A', fontWeight: 'bold' },
  quizDescription: { color: '#16A34A', fontWeight: '500' },
});

export default CategoriesScreen;
