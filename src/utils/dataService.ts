import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Teacher,
  Student,
  Category,
  Video,
  Question,
  UserProgress,
  QuizAttempt
} from '../types';

// -----------------------
// Storage keys
// -----------------------
const STORAGE_KEYS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  VIDEOS: 'videos',
  QUESTIONS: 'questions',
  PROGRESS: 'progress',
  CURRENT_USER: 'currentUser',
  CURRENT_TEACHER: 'currentTeacher',
  APP_INITIALIZED: 'appInitialized',
};

// 🔹 keep these as separate constants (not inside STORAGE_KEYS)
const SCHEMA_VERSION = '8'; // bump when you change seed data
const STORAGE_KEYS_EXTRAS = {
  APP_VERSION: 'appVersion',
};

class DataService {
  // Initialize app with sample data
  async initializeApp(): Promise<void> {
    const isInitialized = await AsyncStorage.getItem(STORAGE_KEYS.APP_INITIALIZED);

    if (!isInitialized) {
      await this.createSampleData();
      await AsyncStorage.setItem(STORAGE_KEYS.APP_INITIALIZED, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS_EXTRAS.APP_VERSION, SCHEMA_VERSION);
    } else {
      // ensure stored seed matches current schema
      await this.ensureSeedUpToDate();
    }
  }

  // Make sure the seeded data is up-to-date (runs a quick migration if needed)
  async ensureSeedUpToDate(): Promise<void> {
    const ver = await AsyncStorage.getItem(STORAGE_KEYS_EXTRAS.APP_VERSION);
    console.log('🔍 Current version:', ver, '| Target version:', SCHEMA_VERSION);
    
    if (ver !== SCHEMA_VERSION) {
      console.log('🚀 Running migrations from version', ver, 'to', SCHEMA_VERSION);
      // run migrations that fix old typos / structure changes
      await this.migrate_v1_to_v2_fixMeaTypo();
      await this.migrate_v4_to_v5_updateVideoTitles();
      await this.migrate_v5_to_v6_refreshVideoData();
      await this.migrate_v7_to_v8_addPlayCategory();
      await AsyncStorage.setItem(STORAGE_KEYS_EXTRAS.APP_VERSION, SCHEMA_VERSION);
      console.log('✅ Migration completed successfully');
    } else {
      console.log('✨ Data is already up to date');
    }
  }

  // Migration: fix the old filename/title typo "mea_eat.mp4" -> "mia_eat.mp4"
  private async migrate_v1_to_v2_fixMeaTypo(): Promise<void> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) return;
    const videos: Video[] = JSON.parse(raw);
    let changed = false;

    for (const v of videos) {
      if (v.filename === 'mea_eat.mp4' || v.title === 'Mea Eating') {
        v.filename = 'mia_eat.mp4';
        v.title = 'Mia Eating';
        changed = true;
      }
    }

    if (changed) {
      await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    }
  }

  // Migration: update video titles from "Character Action" format to simplified "Character" format
  private async migrate_v4_to_v5_updateVideoTitles(): Promise<void> {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
    if (!raw) return;
    const videos: Video[] = JSON.parse(raw);
    let changed = false;

    const titleMappings: { [key: string]: string } = {
      'Dog Eating': 'Dog',
      'Cat Eating': 'Cat', 
      'Girl Eating': 'Girl',
      'Boy Eating': 'Boy',
      'Woman Eating': 'Woman',
      'Dog Drinking': 'Dog',
      'Cat Drinking': 'Cat',
      'Girl Drinking': 'Girl', 
      'Boy Drinking': 'Boy',
      'Woman Drinking': 'Woman',
      'Dog Sleeping': 'Dog',
      'Cat Sleeping': 'Cat',
      'Girl Sleeping': 'Girl',
      'Boy Sleeping': 'Boy', 
      'Woman Sleeping': 'Woman',
      'Dog Opening': 'Dog',
      'Cat Opening': 'Cat',
      'Girl Opening': 'Girl',
      'Boy Opening': 'Boy',
      'Woman Opening': 'Woman',
      'Dog Drawing': 'Dog',
      'Cat Drawing': 'Cat',
      'Girl Drawing': 'Girl',
      'Boy Drawing': 'Boy',
      'Woman Drawing': 'Woman'
    };

    for (const v of videos) {
      if (titleMappings[v.title]) {
        v.title = titleMappings[v.title];
        changed = true;
      }
    }

    if (changed) {
      await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    }
  }

  // Migration: refresh video data to ensure correct filenames and titles for quiz compatibility
  private async migrate_v5_to_v6_refreshVideoData(): Promise<void> {
    // Completely refresh video data - use new logical names but keep titles simple
    const updatedVideos: Video[] = [
      // Eat category videos
      { id: 'eat_1', categoryId: 'eat', title: 'Dog', filename: 'Eat/dog_eating.mp4', duration: 5, order: 1 },
      { id: 'eat_2', categoryId: 'eat', title: 'Cat', filename: 'Eat/cat_eating.mp4', duration: 5, order: 2 },
      { id: 'eat_3', categoryId: 'eat', title: 'Girl', filename: 'Eat/girl_eating.mp4', duration: 5, order: 3 },
      { id: 'eat_4', categoryId: 'eat', title: 'Boy', filename: 'Eat/boy_eating.mp4', duration: 5, order: 4 },
      { id: 'eat_5', categoryId: 'eat', title: 'Woman', filename: 'Eat/woman_eating.mp4', duration: 5, order: 5 },
      
      // Drink category videos
      { id: 'drink_1', categoryId: 'drink', title: 'Dog', filename: 'Drink/dog_drinking.mp4', duration: 5, order: 1 },
      { id: 'drink_2', categoryId: 'drink', title: 'Cat', filename: 'Drink/cat_drinking.mp4', duration: 5, order: 2 },
      { id: 'drink_3', categoryId: 'drink', title: 'Girl', filename: 'Drink/girl_drinking.mp4', duration: 5, order: 3 },
      { id: 'drink_4', categoryId: 'drink', title: 'Boy', filename: 'Drink/boy_drinking.mp4', duration: 5, order: 4 },
      { id: 'drink_5', categoryId: 'drink', title: 'Woman', filename: 'Drink/woman_drinking.mp4', duration: 5, order: 5 },
      
      // Sleep category videos
      { id: 'sleep_1', categoryId: 'sleep', title: 'Dog', filename: 'Sleep/dog_sleeping.mp4', duration: 5, order: 1 },
      { id: 'sleep_2', categoryId: 'sleep', title: 'Cat', filename: 'Sleep/cat_sleeping.mp4', duration: 5, order: 2 },
      { id: 'sleep_3', categoryId: 'sleep', title: 'Girl', filename: 'Sleep/girl_sleeping.mp4', duration: 5, order: 3 },
      { id: 'sleep_4', categoryId: 'sleep', title: 'Boy', filename: 'Sleep/boy_sleeping.mp4', duration: 5, order: 4 },
      { id: 'sleep_5', categoryId: 'sleep', title: 'Woman', filename: 'Sleep/woman_sleeping.mp4', duration: 5, order: 5 },
      
      // Open category videos
      { id: 'open_1', categoryId: 'open', title: 'Dog', filename: 'Open/dog_opening.mp4', duration: 5, order: 1 },
      { id: 'open_2', categoryId: 'open', title: 'Cat', filename: 'Open/cat_opening.mp4', duration: 5, order: 2 },
      { id: 'open_3', categoryId: 'open', title: 'Girl', filename: 'Open/girl_opening.mp4', duration: 5, order: 3 },
      { id: 'open_4', categoryId: 'open', title: 'Boy', filename: 'Open/boy_opening.mp4', duration: 5, order: 4 },
      { id: 'open_5', categoryId: 'open', title: 'Woman', filename: 'Open/woman_opening.mp4', duration: 5, order: 5 },
      
      // Draw category videos
      { id: 'draw_1', categoryId: 'draw', title: 'Dog', filename: 'Draw/dog_drawing.mp4', duration: 5, order: 1 },
      { id: 'draw_2', categoryId: 'draw', title: 'Cat', filename: 'Draw/cat_drawing.mp4', duration: 5, order: 2 },
      { id: 'draw_3', categoryId: 'draw', title: 'Girl', filename: 'Draw/girl_drawing.mp4', duration: 5, order: 3 },
      { id: 'draw_4', categoryId: 'draw', title: 'Boy', filename: 'Draw/boy_drawing.mp4', duration: 5, order: 4 },
      { id: 'draw_5', categoryId: 'draw', title: 'Woman', filename: 'Draw/woman_drawing.mp4', duration: 5, order: 5 },
    ];

    await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(updatedVideos));
  }

  // Migration: Add Play category and videos for v7 to v8
  private async migrate_v7_to_v8_addPlayCategory(): Promise<void> {
    try {
      console.log('🔄 Starting migration v7 to v8: Adding Play category...');
      
      // Add Play category to existing categories
      const categoriesRaw = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      console.log('📂 Current categories data:', categoriesRaw);
      
      if (categoriesRaw) {
        const categories: Category[] = JSON.parse(categoriesRaw);
        console.log('📋 Parsed categories:', categories.map(c => c.id));
        
        // Check if Play category already exists
        const hasPlayCategory = categories.some(cat => cat.id === 'play');
        console.log('🎮 Play category exists?', hasPlayCategory);
        
        if (!hasPlayCategory) {
          const playCategory: Category = {
            id: 'play',
            name: 'Play',
            description: 'Learn about playing actions',
            icon: 'game-controller',
            videoCount: 5,
            unlocked: true
          };
          categories.push(playCategory);
          await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
          console.log('✅ Added Play category to storage');
        } else {
          console.log('⚠️ Play category already exists, skipping');
        }
      } else {
        console.log('❌ No categories data found in storage');
      }

      // Add Play videos to existing videos
      const videosRaw = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
      if (videosRaw) {
        const videos: Video[] = JSON.parse(videosRaw);
        console.log('🎬 Current video count:', videos.length);
        
        // Check if Play videos already exist
        const hasPlayVideos = videos.some(video => video.categoryId === 'play');
        console.log('🎮 Play videos exist?', hasPlayVideos);
        
        if (!hasPlayVideos) {
          const playVideos: Video[] = [
            { id: 'play_1', categoryId: 'play', title: 'Dog', filename: 'Play/dog_playing.mp4', duration: 5, order: 1 },
            { id: 'play_2', categoryId: 'play', title: 'Cat', filename: 'Play/cat_playing.mp4', duration: 5, order: 2 },
            { id: 'play_3', categoryId: 'play', title: 'Girl', filename: 'Play/girl_playing.mp4', duration: 5, order: 3 },
            { id: 'play_4', categoryId: 'play', title: 'Boy', filename: 'Play/boy_playing.mp4', duration: 5, order: 4 },
            { id: 'play_5', categoryId: 'play', title: 'Woman', filename: 'Play/woman_playing.mp4', duration: 5, order: 5 },
          ];
          videos.push(...playVideos);
          await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
          console.log('✅ Added', playVideos.length, 'Play videos to storage');
        } else {
          console.log('⚠️ Play videos already exist, skipping');
        }
      } else {
        console.log('❌ No videos data found in storage');
      }

      console.log('🎉 Successfully completed migration v7 to v8');
    } catch (error) {
      console.error('💥 Error during v7 to v8 migration:', error);
    }
  }

  // DEBUG: Force add Play category (call this manually if migration isn't working)
  async forceAddPlayCategory(): Promise<void> {
    console.log('🚀 Force adding Play category...');
    await this.migrate_v7_to_v8_addPlayCategory();
    
    // Force version update
    await AsyncStorage.setItem(STORAGE_KEYS_EXTRAS.APP_VERSION, SCHEMA_VERSION);
    console.log('🔄 Updated schema version to', SCHEMA_VERSION);
  }

  // Create sample data for testing
  private async createSampleData(): Promise<void> {
    // Sample teacher
    const teacher: Teacher = {
      id: 'teacher_1',
      name: 'Ms. Johnson',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: 'demo123',
      role: 'teacher',
      students: ['student_1', 'student_2', 'student_3'],
    };

    // Sample students
    const students: Student[] = [
      { 
        id: 'student_1', 
        name: 'Alex Thompson', 
        firstName: 'Alex', 
        lastName: 'Thompson',
        role: 'student', 
        teacherId: 'teacher_1' 
      },
      { 
        id: 'student_2', 
        name: 'Emma Williams', 
        firstName: 'Emma', 
        lastName: 'Williams',
        role: 'student', 
        teacherId: 'teacher_1' 
      },
      { 
        id: 'student_3', 
        name: 'Sam Davis', 
        firstName: 'Sam', 
        lastName: 'Davis',
        role: 'student', 
        teacherId: 'teacher_1' 
      },
    ];

    const users = [teacher, ...students];

    // Sample categories - all unlocked from start
    const categories: Category[] = [
      { id: 'eat',   name: 'Eat',   description: 'Learn about eating actions',   icon: 'restaurant',      videoCount: 5, unlocked: true  },
      { id: 'drink', name: 'Drink', description: 'Learn about drinking actions', icon: 'water',           videoCount: 5, unlocked: true  },
      { id: 'sleep', name: 'Sleep', description: 'Learn about sleeping actions', icon: 'bed',             videoCount: 5, unlocked: true },
      { id: 'open',  name: 'Open',  description: 'Learn about opening actions',  icon: 'open',            videoCount: 5, unlocked: true },
      { id: 'draw',  name: 'Draw',  description: 'Learn about drawing actions',  icon: 'brush',           videoCount: 5, unlocked: true },
      { id: 'play',  name: 'Play',  description: 'Learn about playing actions',  icon: 'game-controller', videoCount: 5, unlocked: true },
    ];

    // Sample videos using actual uploaded files
    const videos: Video[] = [
      // Eat category videos
      { id: 'eat_1', categoryId: 'eat', title: 'Dog', filename: 'Eat/dog_eating.mp4', duration: 5, order: 1 },
      { id: 'eat_2', categoryId: 'eat', title: 'Cat', filename: 'Eat/cat_eating.mp4', duration: 5, order: 2 },
      { id: 'eat_3', categoryId: 'eat', title: 'Girl', filename: 'Eat/girl_eating.mp4', duration: 5, order: 3 },
      { id: 'eat_4', categoryId: 'eat', title: 'Boy', filename: 'Eat/boy_eating.mp4', duration: 5, order: 4 },
      { id: 'eat_5', categoryId: 'eat', title: 'Woman', filename: 'Eat/woman_eating.mp4', duration: 5, order: 5 },
      
      // Drink category videos
      { id: 'drink_1', categoryId: 'drink', title: 'Dog', filename: 'Drink/dog_drinking.mp4', duration: 5, order: 1 },
      { id: 'drink_2', categoryId: 'drink', title: 'Cat', filename: 'Drink/cat_drinking.mp4', duration: 5, order: 2 },
      { id: 'drink_3', categoryId: 'drink', title: 'Girl', filename: 'Drink/girl_drinking.mp4', duration: 5, order: 3 },
      { id: 'drink_4', categoryId: 'drink', title: 'Boy', filename: 'Drink/boy_drinking.mp4', duration: 5, order: 4 },
      { id: 'drink_5', categoryId: 'drink', title: 'Woman', filename: 'Drink/woman_drinking.mp4', duration: 5, order: 5 },
      
      // Sleep category videos
      { id: 'sleep_1', categoryId: 'sleep', title: 'Dog', filename: 'Sleep/dog_sleeping.mp4', duration: 5, order: 1 },
      { id: 'sleep_2', categoryId: 'sleep', title: 'Cat', filename: 'Sleep/cat_sleeping.mp4', duration: 5, order: 2 },
      { id: 'sleep_3', categoryId: 'sleep', title: 'Girl', filename: 'Sleep/girl_sleeping.mp4', duration: 5, order: 3 },
      { id: 'sleep_4', categoryId: 'sleep', title: 'Boy', filename: 'Sleep/boy_sleeping.mp4', duration: 5, order: 4 },
      { id: 'sleep_5', categoryId: 'sleep', title: 'Woman', filename: 'Sleep/woman_sleeping.mp4', duration: 5, order: 5 },
      
      // Open category videos
      { id: 'open_1', categoryId: 'open', title: 'Dog', filename: 'Open/dog_opening.mp4', duration: 5, order: 1 },
      { id: 'open_2', categoryId: 'open', title: 'Cat', filename: 'Open/cat_opening.mp4', duration: 5, order: 2 },
      { id: 'open_3', categoryId: 'open', title: 'Girl', filename: 'Open/girl_opening.mp4', duration: 5, order: 3 },
      { id: 'open_4', categoryId: 'open', title: 'Boy', filename: 'Open/boy_opening.mp4', duration: 5, order: 4 },
      { id: 'open_5', categoryId: 'open', title: 'Woman', filename: 'Open/woman_opening.mp4', duration: 5, order: 5 },
      
      // Draw category videos
      { id: 'draw_1', categoryId: 'draw', title: 'Dog', filename: 'Draw/dog_drawing.mp4', duration: 5, order: 1 },
      { id: 'draw_2', categoryId: 'draw', title: 'Cat', filename: 'Draw/cat_drawing.mp4', duration: 5, order: 2 },
      { id: 'draw_3', categoryId: 'draw', title: 'Girl', filename: 'Draw/girl_drawing.mp4', duration: 5, order: 3 },
      { id: 'draw_4', categoryId: 'draw', title: 'Boy', filename: 'Draw/boy_drawing.mp4', duration: 5, order: 4 },
      { id: 'draw_5', categoryId: 'draw', title: 'Woman', filename: 'Draw/woman_drawing.mp4', duration: 5, order: 5 },
      
      // Play category videos
      { id: 'play_1', categoryId: 'play', title: 'Dog', filename: 'Play/dog_playing.mp4', duration: 5, order: 1 },
      { id: 'play_2', categoryId: 'play', title: 'Cat', filename: 'Play/cat_playing.mp4', duration: 5, order: 2 },
      { id: 'play_3', categoryId: 'play', title: 'Girl', filename: 'Play/girl_playing.mp4', duration: 5, order: 3 },
      { id: 'play_4', categoryId: 'play', title: 'Boy', filename: 'Play/boy_playing.mp4', duration: 5, order: 4 },
      { id: 'play_5', categoryId: 'play', title: 'Woman', filename: 'Play/woman_playing.mp4', duration: 5, order: 5 },
    ];

    // Sample questions - multiple questions per category for better quiz experience
    const questions: Question[] = [
      // Eat category questions
      {
        id: 'q_eat_1',
        videoId: 'eat_1',
        categoryId: 'eat',
        question: 'What action is being performed?',
        options: [
          { id: 'opt_1', text: 'Eating' },
          { id: 'opt_2', text: 'Drinking' },
          { id: 'opt_3', text: 'Sleeping' },
          { id: 'opt_4', text: 'Drawing' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_eat_2',
        videoId: 'eat_2',
        categoryId: 'eat',
        question: 'What is this character doing?',
        options: [
          { id: 'opt_1', text: 'Eating food' },
          { id: 'opt_2', text: 'Playing games' },
          { id: 'opt_3', text: 'Reading books' },
          { id: 'opt_4', text: 'Taking a bath' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_eat_3',
        videoId: 'eat_3',
        categoryId: 'eat',
        question: 'Which category does this video belong to?',
        options: [
          { id: 'opt_1', text: 'Eat' },
          { id: 'opt_2', text: 'Drink' },
          { id: 'opt_3', text: 'Open' },
          { id: 'opt_4', text: 'Sleep' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },

      // Drink category questions
      {
        id: 'q_drink_1',
        videoId: 'drink_1',
        categoryId: 'drink',
        question: 'What action is being performed?',
        options: [
          { id: 'opt_1', text: 'Drinking' },
          { id: 'opt_2', text: 'Eating' },
          { id: 'opt_3', text: 'Opening' },
          { id: 'opt_4', text: 'Drawing' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_drink_2',
        videoId: 'drink_2',
        categoryId: 'drink',
        question: 'What is this character doing?',
        options: [
          { id: 'opt_1', text: 'Drinking water' },
          { id: 'opt_2', text: 'Washing hands' },
          { id: 'opt_3', text: 'Cooking food' },
          { id: 'opt_4', text: 'Cleaning up' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },

      // Sleep category questions  
      {
        id: 'q_sleep_1',
        videoId: 'sleep_1',
        categoryId: 'sleep',
        question: 'What action is being performed?',
        options: [
          { id: 'opt_1', text: 'Sleeping' },
          { id: 'opt_2', text: 'Running' },
          { id: 'opt_3', text: 'Jumping' },
          { id: 'opt_4', text: 'Dancing' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_sleep_2',
        videoId: 'sleep_2',
        categoryId: 'sleep',
        question: 'Which category does this video belong to?',
        options: [
          { id: 'opt_1', text: 'Sleep' },
          { id: 'opt_2', text: 'Eat' },
          { id: 'opt_3', text: 'Drink' },
          { id: 'opt_4', text: 'Draw' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },

      // Open category questions
      {
        id: 'q_open_1',
        videoId: 'open_1',
        categoryId: 'open',
        question: 'What action is being performed?',
        options: [
          { id: 'opt_1', text: 'Opening' },
          { id: 'opt_2', text: 'Closing' },
          { id: 'opt_3', text: 'Breaking' },
          { id: 'opt_4', text: 'Fixing' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_open_2',
        videoId: 'open_2',
        categoryId: 'open',
        question: 'What is this character doing?',
        options: [
          { id: 'opt_1', text: 'Opening something' },
          { id: 'opt_2', text: 'Hiding something' },
          { id: 'opt_3', text: 'Throwing something' },
          { id: 'opt_4', text: 'Buying something' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },

      // Draw category questions
      {
        id: 'q_draw_1',
        videoId: 'draw_1',
        categoryId: 'draw',
        question: 'What action is being performed?',
        options: [
          { id: 'opt_1', text: 'Drawing' },
          { id: 'opt_2', text: 'Erasing' },
          { id: 'opt_3', text: 'Cutting' },
          { id: 'opt_4', text: 'Folding' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
      {
        id: 'q_draw_2',
        videoId: 'draw_2',
        categoryId: 'draw',
        question: 'Which category does this video belong to?',
        options: [
          { id: 'opt_1', text: 'Draw' },
          { id: 'opt_2', text: 'Sleep' },
          { id: 'opt_3', text: 'Open' },
          { id: 'opt_4', text: 'Eat' },
        ],
        correctAnswer: 'opt_1',
        answerFormat: 'text',
      },
    ];

    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    await AsyncStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
    await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify([]));
  }

  // User management
  async getUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async getTeachers(): Promise<Teacher[]> {
    const users = await this.getUsers();
    return users.filter(user => user.role === 'teacher') as Teacher[];
  }

  async getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    const users = await this.getUsers();
    return users.filter(user => user.role === 'student' && user.teacherId === teacherId) as Student[];
  }

  async getCurrentUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  }

  async setCurrentUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  // Teacher session management
  async getCurrentTeacher(): Promise<Teacher | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
    return data ? JSON.parse(data) : null;
  }

  async setCurrentTeacher(teacher: Teacher): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(teacher));
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
  }

  // Category management
  async getCategories(): Promise<Category[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  }

  async unlockCategory(categoryId: string): Promise<void> {
    const categories = await this.getCategories();
    const updatedCategories = categories.map(cat =>
      cat.id === categoryId ? { ...cat, unlocked: true } : cat
    );
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
  }

  // Video management
  async getVideosByCategory(categoryId: string): Promise<Video[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
    const videos: Video[] = data ? JSON.parse(data) : [];
    return videos
      .filter(video => video.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  async getAllVideos(): Promise<Video[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VIDEOS);
    const videos: Video[] = data ? JSON.parse(data) : [];
    return videos.sort((a, b) => a.order - b.order);
  }

  // Progress management
  async getUserProgress(userId: string, categoryId?: string): Promise<UserProgress[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    const allProgress: UserProgress[] = data ? JSON.parse(data) : [];

    let userProgress = allProgress.filter(progress => progress.userId === userId);

    if (categoryId) {
      userProgress = userProgress.filter(progress => progress.categoryId === categoryId);
    }

    return userProgress;
  }

  async updateUserProgress(progress: UserProgress): Promise<void> {
    const allProgress = await this.getAllProgress();
    const existingIndex = allProgress.findIndex(
      p => p.userId === progress.userId && p.categoryId === progress.categoryId
    );

    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
  }

  async getAllProgress(): Promise<UserProgress[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PROGRESS);
    return data ? JSON.parse(data) : [];
  }

  // Quiz management
  async getQuestionsByCategory(categoryId: string): Promise<Question[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    const questions: Question[] = data ? JSON.parse(data) : [];
    return questions.filter(question => question.categoryId === categoryId);
  }

  async getAllQuestions(): Promise<Question[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    return data ? JSON.parse(data) : [];
  }

  async addQuizAttempt(userId: string, categoryId: string, attempt: QuizAttempt): Promise<void> {
    const userProgress = await this.getUserProgress(userId, categoryId);

    if (userProgress.length > 0) {
      // Update existing progress
      const progress = userProgress[0];
      progress.quizAttempts.push(attempt);
      await this.updateUserProgress(progress);
    } else {
      // Create new progress record with quiz attempt
      const newProgress: UserProgress = {
        userId,
        categoryId,
        videosWatched: [],
        quizAttempts: [attempt],
        hasCompletedSequence: false,
      };
      await this.updateUserProgress(newProgress);
    }
  }

  // Teacher management
  async addTeacher(teacherData: Omit<Teacher, 'id' | 'students'>): Promise<Teacher> {
    const users = await this.getUsers();
    const newTeacher: Teacher = {
      ...teacherData,
      id: this.generateId('teacher'),
      students: [],
    };

    users.push(newTeacher);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newTeacher;
  }

  async authenticateTeacher(teacherId: string, password: string): Promise<boolean> {
    const users = await this.getUsers();
    const teacher = users.find(user => user.id === teacherId && user.role === 'teacher') as Teacher;
    return teacher ? teacher.password === password : false;
  }

  // Student management
  async addStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
    const users = await this.getUsers();
    const newStudent: Student = {
      ...studentData,
      id: this.generateId('student'),
    };

    users.push(newStudent);

    // Update teacher's student list
    const teacherIndex = users.findIndex(user => user.id === studentData.teacherId && user.role === 'teacher');
    if (teacherIndex >= 0) {
      const teacher = users[teacherIndex] as Teacher;
      teacher.students.push(newStudent.id);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newStudent;
  }

  // Delete teacher
  async deleteTeacher(teacherId: string): Promise<void> {
    const users = await this.getUsers();
    const teacherIndex = users.findIndex(user => user.id === teacherId && user.role === 'teacher');
    
    if (teacherIndex === -1) {
      throw new Error('Teacher not found');
    }

    // Remove teacher from users
    users.splice(teacherIndex, 1);
    
    // Note: Students belonging to this teacher will become "orphaned"
    // You might want to handle this differently in production
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Clear teacher session if deleting current teacher
    const currentTeacher = await this.getCurrentTeacher();
    if (currentTeacher && currentTeacher.id === teacherId) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Update student
  async updateStudent(updatedStudent: Student): Promise<void> {
    const users = await this.getUsers();
    const studentIndex = users.findIndex(user => user.id === updatedStudent.id && user.role === 'student');
    
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }

    // Update student in users array
    users[studentIndex] = updatedStudent;
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current user session if updating current student
    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.id === updatedStudent.id) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedStudent));
    }
  }
  
  // Update teacher
  async updateTeacher(updatedTeacher: Teacher): Promise<void> {
    const users = await this.getUsers();
    const teacherIndex = users.findIndex(user => user.id === updatedTeacher.id && user.role === 'teacher');
    
    if (teacherIndex === -1) {
      throw new Error('Teacher not found');
    }

    // Update teacher in users array
    users[teacherIndex] = updatedTeacher;
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update current teacher session if updating current teacher
    const currentTeacher = await this.getCurrentTeacher();
    if (currentTeacher && currentTeacher.id === updatedTeacher.id) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(updatedTeacher));
    }
    
    // Update current user session if teacher is also the current user
    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.id === updatedTeacher.id) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedTeacher));
    }
  }

  // Delete student
  async deleteStudent(studentId: string): Promise<void> {
    const users = await this.getUsers();
    const studentIndex = users.findIndex(user => user.id === studentId && user.role === 'student');
    
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }

    const student = users[studentIndex] as Student;
    
    // Remove student from teacher's student list
    const teacherIndex = users.findIndex(user => user.id === student.teacherId && user.role === 'teacher');
    if (teacherIndex >= 0) {
      const teacher = users[teacherIndex] as Teacher;
      teacher.students = teacher.students.filter(id => id !== studentId);
    }
    
    // Remove student from users
    users.splice(studentIndex, 1);
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Clear student session if deleting current student
    const currentUser = await this.getCurrentUser();
    if (currentUser && currentUser.id === studentId) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Check if teacher has students (for warning purposes)
  async teacherHasStudents(teacherId: string): Promise<number> {
    const students = await this.getStudentsByTeacher(teacherId);
    return students.length;
  }

  // Helper method to generate unique IDs
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Method to completely reset app data - deletes ALL user data and returns app to starting state
  async clearAllData(): Promise<void> {
    try {
      // Clear ALL stored data
      await AsyncStorage.clear();
      
      // Reinitialize the app with fresh sample data
      await this.initializeApp();
      
      // Ensure no user sessions remain active
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_TEACHER);
      
    } catch (error) {
      console.error('Error clearing app data:', error);
      throw error;
    }
  }
}

export default new DataService();